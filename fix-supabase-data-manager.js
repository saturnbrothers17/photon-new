const fs = require('fs');

function fixSupabaseDataManager() {
  try {
    console.log('🔧 Creating a clean version of the supabase data manager...');
    
    const filePath = 'src/lib/supabase-data-manager.ts';
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find and replace the problematic getAllTests function
    const getAllTestsStart = content.indexOf('async getAllTests(filters?: TestFilters): Promise<TestWithQuestions[]> {');
    const getAllTestsEnd = content.indexOf('  }', getAllTestsStart + 1000) + 3; // Find the closing brace
    
    if (getAllTestsStart === -1 || getAllTestsEnd === -1) {
      console.log('❌ Could not find getAllTests function boundaries');
      return;
    }
    
    const newGetAllTestsFunction = `async getAllTests(filters?: TestFilters): Promise<TestWithQuestions[]> {
    try {
      console.log('🔄 Fetching tests from Supabase...');
      
      let query = supabaseAdmin
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters?.class_level) {
        query = query.eq('class_level', filters.class_level);
      }
      if (filters?.search) {
        query = query.ilike('title', \`%\${filters.search}%\`);
      }

      const { data: tests, error: testsError } = await query;

      if (testsError) {
        console.error('❌ Error fetching tests:', testsError);
        throw testsError;
      }

      if (!tests) {
        return [];
      }

      // Apply published filter in JavaScript if specified
      let filteredTests = tests;
      if (filters?.published !== undefined) {
        filteredTests = tests.filter(test => {
          const testPublished = test.published ?? test.is_published ?? false;
          return testPublished === filters.published;
        });
      }

      // For each test, fetch its questions (with fallback for missing questions table)
      const testsWithQuestions = await Promise.all(
        filteredTests.map(async (test) => {
          try {
            const { data: questions, error: questionsError } = await supabaseAdmin
              .from('questions')
              .select('*')
              .eq('test_id', test.id);

            if (questionsError) {
              // If questions table doesn't exist, check if test has questions in JSON format
              if (questionsError.message?.includes('Could not find the table')) {
                console.warn(\`⚠️ Questions table not found for test \${test.id}\`);
                
                // Check if test has questions stored as JSON
                if (test.questions && typeof test.questions === 'string') {
                  try {
                    const storedQuestions = JSON.parse(test.questions);
                    if (Array.isArray(storedQuestions) && storedQuestions.length > 0) {
                      console.log(\`📝 Using questions from test record for \${test.title}\`);
                      return { ...test, questions: storedQuestions };
                    }
                  } catch (parseError) {
                    console.warn(\`⚠️ Could not parse stored questions for test \${test.id}\`);
                  }
                }
                
                // Return empty questions array
                console.log(\`📝 No questions available for test \${test.title}\`);
                return { ...test, questions: [] };
              }
              
              console.error(\`❌ Error fetching questions for test \${test.id}:\`, questionsError);
              return { ...test, questions: [] }; 
            }

            return { ...test, questions: questions || [] };
          } catch (error) {
            console.error(\`❌ Exception fetching questions for test \${test.id}:\`, error);
            return { ...test, questions: [] };
          }
        })
      );

      console.log(\`✅ Fetched \${testsWithQuestions.length} tests\`);
      return testsWithQuestions;
    } catch (error) {
      console.error('❌ Error fetching tests:', error);
      throw error;
    }
  }`;
    
    // Replace the function
    const beforeFunction = content.substring(0, getAllTestsStart);
    const afterFunction = content.substring(getAllTestsEnd);
    
    const newContent = beforeFunction + newGetAllTestsFunction + afterFunction;
    
    // Write the updated content
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log('✅ Successfully fixed supabase data manager');
    console.log('✅ Syntax errors should be resolved');
    
  } catch (error) {
    console.error('❌ Error fixing data manager:', error);
  }
}

fixSupabaseDataManager();