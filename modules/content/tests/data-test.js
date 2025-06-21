// 🧪 Data Structure Validation Tests
// Phase 2: Content Module Data Tests

class ContentDataTester {
    constructor() {
        this.testResults = [];
        this.errors = [];
    }

    // Log test results
    logResult(testName, passed, message) {
        this.testResults.push({
            test: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        if (!passed) {
            this.errors.push(`❌ ${testName}: ${message}`);
        }
        
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
    }

    // 1. CURRICULUM STRUCTURE TESTS
    validateCurriculumStructure(curriculum) {
        try {
            // Required fields test
            const requiredFields = ['title', 'description', 'totalDays', 'days'];
            for (let field of requiredFields) {
                if (!curriculum.hasOwnProperty(field)) {
                    this.logResult('Curriculum Required Fields', false, `Missing field: ${field}`);
                    return false;
                }
            }

            // Data types test
            if (typeof curriculum.title !== 'string' || curriculum.title.length === 0) {
                this.logResult('Curriculum Title', false, 'Title must be non-empty string');
                return false;
            }

            if (typeof curriculum.totalDays !== 'number' || curriculum.totalDays !== 7) {
                this.logResult('Curriculum Total Days', false, 'totalDays must be 7');
                return false;
            }

            if (!Array.isArray(curriculum.days) || curriculum.days.length !== 7) {
                this.logResult('Curriculum Days Array', false, 'days must be array with 7 elements');
                return false;
            }

            this.logResult('Curriculum Structure', true, 'All curriculum structure tests passed');
            return true;

        } catch (error) {
            this.logResult('Curriculum Validation', false, `Validation error: ${error.message}`);
            return false;
        }
    }

    // 2. DAY DATA STRUCTURE TESTS
    validateDayDataStructure(dayData, expectedDay) {
        try {
            // Required fields for day data
            const requiredFields = ['day', 'title', 'duration', 'sections'];
            for (let field of requiredFields) {
                if (!dayData.hasOwnProperty(field)) {
                    this.logResult(`Day ${expectedDay} Required Fields`, false, `Missing field: ${field}`);
                    return false;
                }
            }

            // Day number validation
            if (dayData.day !== expectedDay) {
                this.logResult(`Day ${expectedDay} Number`, false, `Expected day ${expectedDay}, got ${dayData.day}`);
                return false;
            }

            // Title validation
            if (typeof dayData.title !== 'string' || dayData.title.length === 0) {
                this.logResult(`Day ${expectedDay} Title`, false, 'Title must be non-empty string');
                return false;
            }

            // Duration validation
            if (typeof dayData.duration !== 'number' || dayData.duration <= 0) {
                this.logResult(`Day ${expectedDay} Duration`, false, 'Duration must be positive number');
                return false;
            }

            // Sections validation
            if (!Array.isArray(dayData.sections) || dayData.sections.length === 0) {
                this.logResult(`Day ${expectedDay} Sections`, false, 'Sections must be non-empty array');
                return false;
            }

            // Validate each section
            for (let i = 0; i < dayData.sections.length; i++) {
                if (!this.validateSectionStructure(dayData.sections[i], expectedDay, i + 1)) {
                    return false;
                }
            }

            this.logResult(`Day ${expectedDay} Structure`, true, 'Day data structure is valid');
            return true;

        } catch (error) {
            this.logResult(`Day ${expectedDay} Validation`, false, `Validation error: ${error.message}`);
            return false;
        }
    }

    // 3. SECTION STRUCTURE TESTS
    validateSectionStructure(section, dayNumber, sectionNumber) {
        try {
            const requiredFields = ['id', 'title', 'content', 'type'];
            for (let field of requiredFields) {
                if (!section.hasOwnProperty(field)) {
                    this.logResult(`Day ${dayNumber} Section ${sectionNumber} Fields`, false, `Missing field: ${field}`);
                    return false;
                }
            }

            // ID validation
            if (typeof section.id !== 'string' || section.id.length === 0) {
                this.logResult(`Day ${dayNumber} Section ${sectionNumber} ID`, false, 'Section ID must be non-empty string');
                return false;
            }

            // Type validation
            const validTypes = ['text', 'image', 'video', 'diagram', 'exercise'];
            if (!validTypes.includes(section.type)) {
                this.logResult(`Day ${dayNumber} Section ${sectionNumber} Type`, false, `Invalid type: ${section.type}`);
                return false;
            }

            // Content validation based on type
            if (section.type === 'text' && (typeof section.content !== 'string' || section.content.length < 10)) {
                this.logResult(`Day ${dayNumber} Section ${sectionNumber} Content`, false, 'Text content must be substantial string');
                return false;
            }

            this.logResult(`Day ${dayNumber} Section ${sectionNumber}`, true, 'Section structure is valid');
            return true;

        } catch (error) {
            this.logResult(`Day ${dayNumber} Section ${sectionNumber}`, false, `Section validation error: ${error.message}`);
            return false;
        }
    }

    // 4. CONTENT QUALITY TESTS
    validateContentQuality(dayData) {
        try {
            let totalTextLength = 0;
            let textSections = 0;

            for (let section of dayData.sections) {
                if (section.type === 'text') {
                    totalTextLength += section.content.length;
                    textSections++;
                }
            }

            // Minimum content length test
            if (totalTextLength < 500) {
                this.logResult(`Day ${dayData.day} Content Length`, false, `Insufficient content: ${totalTextLength} chars`);
                return false;
            }

            // Content distribution test
            if (textSections === 0) {
                this.logResult(`Day ${dayData.day} Text Sections`, false, 'No text sections found');
                return false;
            }

            this.logResult(`Day ${dayData.day} Content Quality`, true, `${textSections} text sections, ${totalTextLength} chars`);
            return true;

        } catch (error) {
            this.logResult(`Day ${dayData.day} Quality Check`, false, `Quality validation error: ${error.message}`);
            return false;
        }
    }

    // 5. CROSS-REFERENCE TESTS
    validateCrossReferences(curriculum, allDayData) {
        try {
            // Test that curriculum.days matches actual day files
            for (let i = 0; i < curriculum.days.length; i++) {
                const expectedDay = i + 1;
                const dayInfo = curriculum.days[i];
                const actualDayData = allDayData[expectedDay];

                if (!actualDayData) {
                    this.logResult('Cross Reference', false, `Day ${expectedDay} data missing`);
                    return false;
                }

                // Check day number consistency
                if (dayInfo.day !== actualDayData.day) {
                    this.logResult('Cross Reference Day Number', false, `Day number mismatch for day ${expectedDay}`);
                    return false;
                }

                // Check title consistency
                if (dayInfo.title !== actualDayData.title) {
                    this.logResult('Cross Reference Title', false, `Title mismatch for day ${expectedDay}`);
                    return false;
                }
            }

            this.logResult('Cross References', true, 'All cross-references are valid');
            return true;

        } catch (error) {
            this.logResult('Cross Reference Validation', false, `Cross-reference error: ${error.message}`);
            return false;
        }
    }

    // RUN ALL TESTS
    async runAllTests() {
        console.log('🧪 Starting Content Data Validation Tests...');
        this.testResults = [];
        this.errors = [];

        try {
            // Test data would be loaded here in actual implementation
            // For now, we test the validation functions themselves
            
            // Test 1: Sample curriculum structure
            const sampleCurriculum = {
                title: "Protein Purification Mastery",
                description: "7-day intensive course",
                totalDays: 7,
                days: [
                    { day: 1, title: "Protein Basics", duration: 15 },
                    { day: 2, title: "Purification Methods", duration: 20 },
                    { day: 3, title: "Chromatography", duration: 25 },
                    { day: 4, title: "Electrophoresis", duration: 20 },
                    { day: 5, title: "Troubleshooting", duration: 18 },
                    { day: 6, title: "Optimization", duration: 22 },
                    { day: 7, title: "Advanced Techniques", duration: 25 }
                ]
            };

            this.validateCurriculumStructure(sampleCurriculum);

            // Test 2: Sample day data structure
            const sampleDayData = {
                day: 1,
                title: "Protein Basics",
                duration: 15,
                sections: [
                    {
                        id: "intro",
                        title: "Hvad er proteiner?",
                        content: "Proteiner er store, komplekse molekyler der spiller mange kritiske roller i kroppen. De består af aminosyrer...",
                        type: "text"
                    },
                    {
                        id: "structure",
                        title: "Protein struktur",
                        content: "protein-structure.png",
                        type: "image"
                    }
                ]
            };

            this.validateDayDataStructure(sampleDayData, 1);
            this.validateContentQuality(sampleDayData);

            // Summary
            const passedTests = this.testResults.filter(r => r.passed).length;
            const totalTests = this.testResults.length;
            
            console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
            
            if (this.errors.length > 0) {
                console.log('\n❌ Errors found:');
                this.errors.forEach(error => console.log(error));
            } else {
                console.log('\n✅ All data structure tests passed!');
            }

            return {
                passed: passedTests,
                total: totalTests,
                errors: this.errors,
                results: this.testResults
            };

        } catch (error) {
            console.error('🚨 Test suite error:', error);
            return {
                passed: 0,
                total: 0,
                errors: [error.message],
                results: []
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentDataTester;
}

// Browser global
if (typeof window !== 'undefined') {
    window.ContentDataTester = ContentDataTester;
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('data-test')) {
    window.addEventListener('load', async function() {
        const tester = new ContentDataTester();
        await tester.runAllTests();
    });
}
