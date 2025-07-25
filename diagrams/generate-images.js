const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Directory containing the diagram files
const diagramsDir = __dirname;
const outputDir = path.join(diagramsDir, 'images');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// List of diagram files and their individual diagrams
const diagramFiles = [
    {
        file: 'system_architecture_diagram.md',
        diagrams: [
            { name: 'system_architecture', start: '```mermaid', title: 'System Architecture' }
        ]
    },
    {
        file: 'use_case_diagram.md',
        diagrams: [
            { name: 'use_case', start: '```mermaid', title: 'Use Case Diagram' }
        ]
    },
    {
        file: 'class_diagram.md',
        diagrams: [
            { name: 'class_diagram', start: '```mermaid', title: 'Class Diagram' }
        ]
    },
    {
        file: 'entity_relationship_diagram.md',
        diagrams: [
            { name: 'erd', start: '```mermaid', title: 'Entity Relationship Diagram' }
        ]
    },
    {
        file: 'sequence_diagrams.md',
        diagrams: [
            { name: 'sequence_user_registration', start: 'User Registration Process', title: 'User Registration Sequence' },
            { name: 'sequence_career_assessment', start: 'Career Assessment Flow', title: 'Career Assessment Sequence' },
            { name: 'sequence_learning_module', start: 'Learning Module Access', title: 'Learning Module Sequence' },
            { name: 'sequence_mentorship', start: 'Mentorship Matching', title: 'Mentorship Sequence' }
        ]
    },
    {
        file: 'activity_diagrams.md',
        diagrams: [
            { name: 'activity_user_journey', start: 'Complete User Journey', title: 'Complete User Journey Activity' },
            { name: 'activity_ai_assessment', start: 'AI Career Assessment Process', title: 'AI Assessment Activity' },
            { name: 'activity_mentorship', start: 'Mentorship Workflow', title: 'Mentorship Activity' },
            { name: 'activity_learning', start: 'Learning Module Progression', title: 'Learning Progression Activity' }
        ]
    },
    {
        file: 'flowcharts.md',
        diagrams: [
            { name: 'flowchart_system_decision', start: 'System Decision Making Flow', title: 'System Decision Flowchart' },
            { name: 'flowchart_ai_pipeline', start: 'AI Processing Pipeline', title: 'AI Processing Flowchart' },
            { name: 'flowchart_content_delivery', start: 'Content Delivery Flow', title: 'Content Delivery Flowchart' },
            { name: 'flowchart_error_handling', start: 'Error Handling and Recovery Flow', title: 'Error Handling Flowchart' }
        ]
    }
];

function extractMermaidCode(filePath, searchText) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let startIndex = -1;
    let endIndex = -1;
    
    // Find the section containing the search text
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchText)) {
            // Look for the next ```mermaid
            for (let j = i; j < lines.length; j++) {
                if (lines[j].trim() === '```mermaid') {
                    startIndex = j + 1;
                    break;
                }
            }
            break;
        }
    }
    
    if (startIndex === -1) return null;
    
    // Find the closing ```
    for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].trim() === '```') {
            endIndex = i;
            break;
        }
    }
    
    if (endIndex === -1) return null;
    
    return lines.slice(startIndex, endIndex).join('\n');
}

async function generateImage(mermaidCode, outputPath) {
    return new Promise((resolve, reject) => {
        // Create temporary mermaid file
        const tempFile = path.join(diagramsDir, 'temp.mmd');
        fs.writeFileSync(tempFile, mermaidCode);
        
        // Generate image using mermaid CLI
        const command = `mmdc -i "${tempFile}" -o "${outputPath}" -t neutral -b white`;
        
        exec(command, (error, stdout, stderr) => {
            // Clean up temp file
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            
            if (error) {
                console.error(`Error generating ${outputPath}:`, error.message);
                reject(error);
            } else {
                console.log(`✅ Generated: ${path.basename(outputPath)}`);
                resolve();
            }
        });
    });
}

async function generateAllImages() {
    console.log('🎨 Generating diagram images...\n');
    
    for (const fileInfo of diagramFiles) {
        const filePath = path.join(diagramsDir, fileInfo.file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${fileInfo.file}`);
            continue;
        }
        
        console.log(`📄 Processing: ${fileInfo.file}`);
        
        for (const diagram of fileInfo.diagrams) {
            try {
                const mermaidCode = extractMermaidCode(filePath, diagram.start);
                
                if (!mermaidCode) {
                    console.log(`❌ Could not extract diagram: ${diagram.name}`);
                    continue;
                }
                
                const outputPath = path.join(outputDir, `${diagram.name}.png`);
                await generateImage(mermaidCode, outputPath);
                
                // Also generate SVG version
                const svgOutputPath = path.join(outputDir, `${diagram.name}.svg`);
                await generateImage(mermaidCode, svgOutputPath);
                
            } catch (error) {
                console.error(`❌ Error processing ${diagram.name}:`, error.message);
            }
        }
        
        console.log('');
    }
    
    console.log('🎉 Image generation complete!');
    console.log(`📁 Images saved to: ${outputDir}`);
    console.log('\n📋 Generated files:');
    
    // List all generated files
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
        console.log(`   • ${file}`);
    });
}

// Run the script
generateAllImages().catch(console.error);
