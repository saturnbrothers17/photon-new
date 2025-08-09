import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Starting database setup...');

    // Create questions table
    try {
      const { data: questionsData, error: questionsError } = await supabaseAdmin
        .from('questions')
        .select('*')
        .limit(1);

      if (questionsError && questionsError.message?.includes('Could not find the table')) {
        console.log('📝 Questions table does not exist, creating...');
        
        // Since we can't execute DDL directly, we'll use a workaround
        // Try to create via raw SQL if possible
        const createQuestionsSQL = `
          CREATE TABLE IF NOT EXISTS public.questions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            test_id UUID NOT NULL,
            question_text TEXT NOT NULL,
            question_type VARCHAR(50) DEFAULT 'multiple_choice',
            options JSONB NOT NULL DEFAULT '[]',
            correct_answer TEXT NOT NULL,
            marks INTEGER NOT NULL DEFAULT 1,
            solution JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        // Try using the sql function if it exists
        try {
          const { data: sqlResult, error: sqlError } = await supabaseAdmin
            .rpc('sql', { query: createQuestionsSQL });
          
          if (sqlError) {
            console.log('⚠️ SQL function not available:', sqlError.message);
          } else {
            console.log('✅ Questions table created via SQL function');
          }
        } catch (sqlErr) {
          console.log('⚠️ SQL execution failed:', sqlErr);
        }
      } else {
        console.log('✅ Questions table already exists');
      }
    } catch (err) {
      console.log('⚠️ Questions table check failed:', err);
    }

    // Add sample questions to existing tests
    console.log('📝 Adding sample questions to existing tests...');
    
    const { data: tests, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('id, title, subject');

    if (testsError) {
      console.log('❌ Error fetching tests:', testsError);
    } else {
      console.log(`📋 Found ${tests?.length || 0} tests`);
      
      const results = [];
      
      for (const test of tests || []) {
        try {
          // Try to check if questions exist
          const { data: existingQuestions, error: questionsCheckError } = await supabaseAdmin
            .from('questions')
            .select('id')
            .eq('test_id', test.id);

          if (questionsCheckError) {
            // Questions table doesn't exist, store questions in test record
            console.log(`⚠️ Questions table not accessible, storing questions in test record for "${test.title}"`);
            
            const sampleQuestions = [
              {
                id: `${test.id}-q1`,
                question_text: `What is the fundamental concept in ${test.subject || 'this subject'}?`,
                options: ["Basic Principle", "Advanced Theory", "Core Concept", "Primary Rule"],
                correct_answer: "Core Concept",
                marks: 4
              },
              {
                id: `${test.id}-q2`,
                question_text: `Which method is most effective for solving ${test.subject || 'these'} problems?`,
                options: ["Method A", "Method B", "Method C", "Method D"],
                correct_answer: "Method B",
                marks: 4
              },
              {
                id: `${test.id}-q3`,
                question_text: `What is the key to understanding ${test.subject || 'this subject'}?`,
                options: ["Practice", "Theory", "Application", "All of the above"],
                correct_answer: "All of the above",
                marks: 4
              }
            ];

            // Store questions as JSON in the test record
            const { error: updateError } = await supabaseAdmin
              .from('tests')
              .update({ 
                questions: JSON.stringify(sampleQuestions)
              })
              .eq('id', test.id);

            if (updateError) {
              console.log(`❌ Error updating test "${test.title}":`, updateError);
              results.push({
                test: test.title,
                status: 'error',
                message: updateError.message
              });
            } else {
              console.log(`✅ Added questions to test record for "${test.title}"`);
              results.push({
                test: test.title,
                status: 'success',
                message: 'Questions stored in test record'
              });
            }
          } else if (existingQuestions && existingQuestions.length > 0) {
            console.log(`✅ Test "${test.title}" already has ${existingQuestions.length} questions`);
            results.push({
              test: test.title,
              status: 'exists',
              message: `Already has ${existingQuestions.length} questions`
            });
          } else {
            // Questions table exists but no questions for this test
            const sampleQuestions = [
              {
                test_id: test.id,
                question_text: `What is the fundamental concept in ${test.subject || 'this subject'}?`,
                options: ["Basic Principle", "Advanced Theory", "Core Concept", "Primary Rule"],
                correct_answer: "Core Concept",
                marks: 4
              },
              {
                test_id: test.id,
                question_text: `Which method is most effective for solving ${test.subject || 'these'} problems?`,
                options: ["Method A", "Method B", "Method C", "Method D"],
                correct_answer: "Method B",
                marks: 4
              },
              {
                test_id: test.id,
                question_text: `What is the key to understanding ${test.subject || 'this subject'}?`,
                options: ["Practice", "Theory", "Application", "All of the above"],
                correct_answer: "All of the above",
                marks: 4
              }
            ];

            const { data: insertedQuestions, error: insertError } = await supabaseAdmin
              .from('questions')
              .insert(sampleQuestions)
              .select();

            if (insertError) {
              console.log(`❌ Error adding questions to test "${test.title}":`, insertError);
              results.push({
                test: test.title,
                status: 'error',
                message: insertError.message
              });
            } else {
              console.log(`✅ Added ${insertedQuestions?.length || 0} questions to test "${test.title}"`);
              results.push({
                test: test.title,
                status: 'success',
                message: `Added ${insertedQuestions?.length || 0} questions`
              });
            }
          }
        } catch (err: any) {
          console.log(`❌ Error processing test "${test.title}":`, err.message);
          results.push({
            test: test.title,
            status: 'error',
            message: err.message
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Database setup completed',
        results
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Could not fetch tests'
    });

  } catch (error: any) {
    console.error('❌ Database setup error:', error);
    return NextResponse.json({
      error: 'Database setup failed',
      details: error.message
    }, { status: 500 });
  }
}