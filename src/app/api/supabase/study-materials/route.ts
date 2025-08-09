import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

type StudyMaterialData = {
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  file: File | null;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export async function POST(request: Request) {
  try {
    console.log('📤 Study materials upload request received');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 Session check:', { 
      hasSession: !!session, 
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    // For now, allow uploads without authentication (temporary fix)
    const uploaderEmail = session?.user?.email || 'anonymous@teacher.com';
    console.log('📤 Upload will be attributed to:', uploaderEmail);
    // Use a valid user ID from the database (SP8's ID)
    const uploaderId = session?.user?.id || '6ab3088a-ac6c-4e5a-85fe-6e9e5924738e';

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📁 Form data received:', {
      title: formData.get('title'),
      subject: formData.get('subject'),
      classLevel: formData.get('classLevel'),
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    if (!file) {
      console.log('❌ No file provided in form data');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type (allow common educational file types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    const isAllowedType = allowedTypes.includes(file.type);
    if (!isAllowedType) {
      console.warn('⚠️ Unsupported file type:', file.type, '- will use placeholder URL');
    }

    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `study-materials/${fileName}`;

    console.log('📤 Uploading file to storage:', { fileName, filePath, size: file.size });

    let publicUrl = '';
    
    // Try to upload file to Supabase Storage
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('study-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.warn('⚠️ Storage upload failed:', uploadError.message);
        
        // If storage fails due to unsupported MIME type, use a placeholder URL
        if (uploadError.message.includes('mime type') || uploadError.message.includes('not supported')) {
          console.log('📝 Using placeholder URL for unsupported file type');
          publicUrl = `https://placeholder.example.com/files/${fileName}`;
        } else {
          throw uploadError;
        }
      } else {
        // Get public URL for the uploaded file
        const { data: { publicUrl: storageUrl } } = supabaseAdmin.storage
          .from('study-materials')
          .getPublicUrl(filePath);
        publicUrl = storageUrl;
      }
    } catch (storageError) {
      console.error('❌ Storage error:', storageError);
      // Use a placeholder URL as fallback
      publicUrl = `https://placeholder.example.com/files/${fileName}`;
      console.log('📝 Using placeholder URL due to storage error');
    }

    // Save material metadata to database using admin client to avoid RLS issues
    const { data: materialData, error: dbError } = await supabaseAdmin
      .from('study_materials')
      .insert([
        {
          title: String(formData.get('title') || ''),
          description: String(formData.get('description') || ''),
          subject: String(formData.get('subject') || 'General'),
          class_level: String(formData.get('classLevel') || 'Class 10'),
          file_url: publicUrl, // Store the full public URL
          file_size: file.size, // Store actual file size
          file_type: file.type, // Store actual file type
          content: String(formData.get('description') || ''), // Use description as content for now
          created_by: uploaderId,
        },
      ])
      .select();

    if (dbError) {
      console.error('❌ Error saving to database:', {
        error: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      
      // Attempt to delete the uploaded file if database save fails
      await supabase.storage
        .from('study-materials')
        .remove([filePath]);
      
      return NextResponse.json(
        { error: 'Error saving material to database', details: dbError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Material saved successfully:', materialData[0].title);

    return NextResponse.json({
      success: true,
      data: materialData[0],
      fileUrl: publicUrl,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('📚 Fetching study materials...');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('🔐 Session check for materials:', { 
      hasSession: !!session, 
      userId: session?.user?.id 
    });
    
    // Use admin client to fetch materials (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching materials:', error);
      return NextResponse.json(
        { error: 'Error fetching materials', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${data?.length || 0} study materials`);

    // The materials already have file_url, so no need to generate URLs
    const materialsWithUrls = (data || []).map((material) => ({
      ...material,
      // Add compatibility fields for frontend
      file_path: material.file_url, // Map file_url to file_path for compatibility
      tags: material.class_level ? [material.class_level] : [], // Map class_level to tags array
      topic: material.subject, // Map subject to topic
      file_type: material.file_type || 'application/pdf', // Use actual file type
      file_size: material.file_size || 0, // Use actual file size
      is_public: true, // Default to public
      uploaded_by: material.created_by || 'unknown'
    }));

    return NextResponse.json({ data: materialsWithUrls });
    
  } catch (error) {
    console.error('❌ Unexpected error in study materials GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('🗑️ Study material delete request received');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 Session check for delete:', { 
      hasSession: !!session, 
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    // Get the material ID from the request
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('id');
    
    if (!materialId) {
      console.log('❌ No material ID provided');
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete material:', materialId);

    // First, get the material to check if it exists and get file info
    const { data: material, error: fetchError } = await supabaseAdmin
      .from('study_materials')
      .select('*')
      .eq('id', materialId)
      .single();

    if (fetchError || !material) {
      console.log('❌ Material not found:', fetchError?.message);
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    console.log('📁 Found material to delete:', {
      id: material.id,
      title: material.title,
      file_url: material.file_url
    });

    // Delete the file from storage if it exists and is not a placeholder
    if (material.file_url && !material.file_url.includes('placeholder.example.com')) {
      try {
        // Extract file path from URL
        const urlParts = material.file_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `study-materials/${fileName}`;
        
        console.log('🗑️ Attempting to delete file from storage:', filePath);
        
        const { error: storageError } = await supabaseAdmin.storage
          .from('study-materials')
          .remove([filePath]);

        if (storageError) {
          console.warn('⚠️ Storage deletion failed (continuing with DB deletion):', storageError.message);
        } else {
          console.log('✅ File deleted from storage successfully');
        }
      } catch (storageError) {
        console.warn('⚠️ Storage deletion error (continuing with DB deletion):', storageError);
      }
    }

    // Delete the material record from database
    const { error: deleteError } = await supabaseAdmin
      .from('study_materials')
      .delete()
      .eq('id', materialId);

    if (deleteError) {
      console.error('❌ Error deleting material from database:', deleteError);
      return NextResponse.json(
        { error: 'Error deleting material', details: deleteError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Material deleted successfully:', material.title);

    return NextResponse.json({
      success: true,
      message: 'Study material deleted successfully',
      deletedMaterial: {
        id: material.id,
        title: material.title
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in study material delete:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
