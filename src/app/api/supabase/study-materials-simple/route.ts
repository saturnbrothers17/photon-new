import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'get-all':
        return await getAllMaterials(body);
      case 'upload':
        return await uploadMaterial(body);
      case 'get-by-subject':
        return await getMaterialsBySubject(body);
      case 'get-by-id':
        return await getMaterialById(body);
      case 'delete':
        return await deleteMaterial(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Study Materials Simple API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAllMaterials(body: any) {
  try {
    console.log('📚 Getting all study materials (simple)');

    // Check if study_materials table exists
    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .select('*')
      .limit(1);

    if (error) {
      console.log('⚠️ Study materials table does not exist, returning empty array');
      
      // Return empty array if table doesn't exist
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No study materials available (table not found)'
      });
    }

    // If table exists, get all materials
    const { data: materials, error: materialsError } = await supabaseAdmin
      .from('study_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (materialsError) {
      console.error('❌ Database error getting materials:', materialsError);
      
      // Return empty array on error
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Error loading study materials'
      });
    }

    console.log('✅ Retrieved study materials:', materials?.length || 0, 'materials');

    return NextResponse.json({
      success: true,
      data: materials || [],
      message: 'Study materials retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getAllMaterials:', error);
    
    // Always return success with empty array to prevent UI errors
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Study materials not available'
    });
  }
}

async function uploadMaterial(body: any) {
  try {
    const { title, description, subject, classLevel, fileUrl, fileName, fileSize, fileType } = body;
    
    console.log('📚 Uploading study material:', title);

    // Check if table exists first
    const { error: checkError } = await supabaseAdmin
      .from('study_materials')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('⚠️ Study materials table does not exist');
      return NextResponse.json({
        success: false,
        error: 'Study materials feature not available (table not found)'
      }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .insert([{
        title,
        description,
        subject,
        file_path: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        tags: [classLevel], // Store class level in tags array
        is_public: true,
        uploaded_by: 'teacher'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error uploading material:', error);
      throw error;
    }

    console.log('✅ Study material uploaded successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Study material uploaded successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in uploadMaterial:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getMaterialsBySubject(body: any) {
  try {
    const { subject, classLevel } = body;
    
    console.log('📚 Getting materials by subject:', subject);

    // Check if table exists first
    const { error: checkError } = await supabaseAdmin
      .from('study_materials')
      .select('id')
      .limit(1);

    if (checkError) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Study materials not available'
      });
    }

    let query = supabaseAdmin
      .from('study_materials')
      .select('*')
      .eq('subject', subject)
      .order('created_at', { ascending: false });

    if (classLevel) {
      query = query.contains('tags', [classLevel]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Database error getting materials by subject:', error);
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Error loading materials'
      });
    }

    console.log('✅ Retrieved materials by subject:', data?.length || 0, 'materials');

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Materials retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getMaterialsBySubject:', error);
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Materials not available'
    });
  }
}

async function getMaterialById(body: any) {
  try {
    const { materialId } = body;
    
    console.log('📚 Getting material by ID:', materialId);

    // Check if table exists first
    const { error: checkError } = await supabaseAdmin
      .from('study_materials')
      .select('id')
      .limit(1);

    if (checkError) {
      return NextResponse.json({
        success: false,
        error: 'Study materials feature not available'
      }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .select('*')
      .eq('id', materialId)
      .eq('is_public', true)
      .single();

    if (error) {
      console.error('❌ Database error getting material by ID:', error);
      return NextResponse.json({
        success: false,
        error: 'Material not found'
      }, { status: 404 });
    }

    // Transform data for compatibility
    const transformedData = {
      ...data,
      file_url: data.file_path,
      class_level: data.tags && data.tags.length > 0 ? data.tags[0] : '10'
    };

    console.log('✅ Retrieved material by ID:', transformedData);

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Material retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in getMaterialById:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function deleteMaterial(body: any) {
  try {
    const { materialId } = body;
    
    console.log('🗑️ Deleting study material:', materialId);

    // Check if table exists first
    const { error: checkError } = await supabaseAdmin
      .from('study_materials')
      .select('id')
      .limit(1);

    if (checkError) {
      return NextResponse.json({
        success: false,
        error: 'Study materials feature not available'
      }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .update({ is_public: false })
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error deleting material:', error);
      throw error;
    }

    console.log('✅ Study material deleted successfully:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Study material deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error in deleteMaterial:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}