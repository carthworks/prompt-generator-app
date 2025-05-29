'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { openDB } from 'idb';

type PromptType = 'text' | 'image' | 'code' | 'audio';

const promptTemplates: Record<PromptType, string> = {
  text: `Use this template for Text Models (e.g., ChatGPT, Claude, Gemini):\n\nGoal: {{goal}}\nContext: {{context}}\nTone: {{tone}}\nStyle: {{style}}\nOutput format: {{format}}\nSpecial instructions: {{instructions}}`,
  image: `Use this template for Image Models (e.g., DALL·E, Midjourney, SDXL):\n\nSubject: {{subject}}\nScene description: {{scene}}\nLighting: {{lighting}}\nArt style: {{style}}\nResolution/aspect: {{resolution}}\nSpecial instructions: {{instructions}}`,
  code: `Use this template for Code Models (e.g., GitHub Copilot, CodeWhisperer):\n\nLanguage: {{language}}\nGoal: {{goal}}\nContext: {{context}}\nConstraints: {{constraints}}\nExpected output: {{output}}\nSpecial instructions: {{instructions}}`,
  audio: `Use this template for Audio/Video Models (e.g., ElevenLabs, RunwayML):\n\nMedia Type: {{media}}\nGoal: {{goal}}\nVoice/Style: {{style}}\nDuration: {{duration}}\nScript or Scene: {{script}}\nSpecial instructions: {{instructions}}`
};

export default function Home() {
  const [type, setType] = useState<PromptType>('text');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);

  useEffect(() => {
    // Load saved prompts from localStorage
    const savedPrompts = localStorage.getItem('promptHistory');
    if (savedPrompts) {
      setPromptHistory(JSON.parse(savedPrompts));
    }
  }, []);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const template = promptTemplates[type];
      const filledPrompt = template.replace(/{{(.*?)}}/g, (_, key) => inputs[key.trim()] || '[NOT SPECIFIED]');
      
      // Add to history
      const newPrompt = {
        type,
        content: filledPrompt,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [newPrompt, ...promptHistory].slice(0, 10);
      setPromptHistory(updatedHistory);
      localStorage.setItem('promptHistory', JSON.stringify(updatedHistory));
      
      setFinalPrompt(filledPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(finalPrompt);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  const renderFields = () => {
    const fieldSets = {
      text: ['goal', 'context', 'tone', 'style', 'format', 'instructions'],
      image: ['subject', 'scene', 'lighting', 'style', 'resolution', 'instructions'],
      code: ['language', 'goal', 'context', 'constraints', 'output', 'instructions'],
      audio: ['media', 'goal', 'style', 'duration', 'script', 'instructions']
    };

    return fieldSets[type].map((field) => (
      <motion.div
        key={field}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Form.Group className="mb-3" controlId={field}>
          <Form.Label className="d-flex align-items-center">
            <span className="text-capitalize">{field.replace(/_/g, ' ')}</span>
            <span className="text-danger ms-2">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name={field}
            placeholder={`Enter ${field}`}
            onChange={handleChange}
          />
          <Form.Text className="text-muted">
            {helperText[type][field]}
          </Form.Text>
        </Form.Group>
      </motion.div>
    ));
  };

  // Complete helper text for all types
  const helperText = {
    text: {
      goal: '🎯 Enter what you want the AI to do or create',
      context: '📝 Add background info, role-play details, or tone preferences',
      tone: '🗣️ Specify formal, casual, professional, friendly etc.',
      style: '✍️ Writing style like academic, creative, technical etc.',
      format: '📋 Desired output structure (paragraph, list, table etc.)',
      instructions: '⚙️ Any additional requirements or preferences'
    },
    image: {
      subject: '🖼️ Main subject or focus of the image',
      scene: '🌄 Description of the environment or setting',
      lighting: '💡 Lighting conditions and atmosphere',
      style: '🎨 Artistic style or visual treatment',
      resolution: '📐 Image dimensions and quality',
      instructions: '⚙️ Additional details or specifications'
    },
    code: {
      language: '💻 Programming language to use',
      goal: '🎯 Purpose of the code',
      context: '📝 Relevant system or project details',
      constraints: '⚠️ Technical limitations or requirements',
      output: '📋 Expected code structure or format',
      instructions: '⚙️ Additional coding guidelines'
    },
    audio: {
      media: '🎵 Type of audio/video content',
      goal: '🎯 Purpose of the audio/video',
      style: '🎨 Voice or production style',
      duration: '⏱️ Length of the content',
      script: '📝 Content or dialogue details',
      instructions: '⚙️ Additional production notes'
    }
  };

  return (
    <Container className="p-4 border rounded shadow">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4 text-center">
          Generative AI Prompt Generator
        </h2>
      </motion.div>

      <Row>
        <Col md={6}>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Select AI Tool Type</Form.Label>
              <Form.Select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="text">📝 Text (ChatGPT, Claude)</option>
                <option value="image">🎨 Image (DALL·E, Midjourney)</option>
                <option value="code">💻 Code (Copilot, CodeWhisperer)</option>
                <option value="audio">🎵 Audio/Video (Runway, ElevenLabs)</option>
              </Form.Select>
            </Form.Group>

            {renderFields()}

            <Button 
              variant="primary"
              className="w-100 mt-3"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Generating...
                </>
              ) : (
                'Generate Prompt'
              )}
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          {showCopyAlert && (
            <Alert variant="success" className="mb-3">
              Prompt copied to clipboard! ✨
            </Alert>
          )}

          {finalPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 border rounded shadow bg-light"
            >
              <h5 className="mb-3">Your Generated Prompt:</h5>
              <Form.Control 
                as="textarea" 
                rows={8} 
                value={finalPrompt}
                readOnly
                className="mb-3"
                onClick={async () => {
                  try {
                    const db = await openDB('promptGeneratorDB', 1, {
                      upgrade(db) {
                        if (!db.objectStoreNames.contains('prompts')) {
                          db.createObjectStore('prompts', { keyPath: 'timestamp' });
                          db.createObjectStore('finalPrompt', { keyPath: 'finalPrompt' });
                        }
                      },
                    });

                    // Add final prompt to database
                    const tx = db.transaction(['finalPrompt'], 'readwrite');
                    const store = tx.objectStore('finalPrompt');
                    await store.add({
                      finalPrompt,
                      timestamp: new Date().toISOString()
                    });
                    await tx.done;

                    const prompts = await db.getAll('prompts');
                    setPromptHistory(prompts);
                  } catch (error) {
                    console.error('Error accessing IndexedDB:', error);
                    // Fallback to localStorage
                    const savedPrompts = localStorage.getItem('promptHistory');
                    if (savedPrompts) {
                      setPromptHistory(JSON.parse(savedPrompts));
                    }
                  }
                }}
              />
              <div className="d-grid gap-2">
                <Button
                  variant="outline-success"
                  onClick={handleCopyToClipboard}
                >
                  📋 Copy to Clipboard
                </Button>
                {type === 'text' && (
                  <Button
                    variant="outline-primary"
                    href="https://chat.openai.com"
                    target="_blank"
                  >
                    🤖 Open in ChatGPT
                  </Button>
                )}
                {type === 'image' && (
                  <Button
                    variant="outline-primary"
                    href="https://www.midjourney.com"
                    target="_blank"
                  >
                    🎨 Open in Midjourney
                  </Button>
                )}
                {type === 'code' && (
                  <Button
                    variant="outline-primary"
                    href="https://github.com/features/copilot"
                    target="_blank"
                  >
                    💻 Open GitHub Copilot
                  </Button>
                )}
                {type === 'audio' && (
                  <Button
                    variant="outline-primary"
                    href="https://elevenlabs.io"
                    target="_blank"
                  >
                    🎵 Open in ElevenLabs
                  </Button>
                )}
              </div>
              {/* <Form.Group className="mb-3">
                <Form.Label>Generated Prompt</Form.Label>
                <Form.Control
                  as="textarea"
                  type="text"
                  rows={4}
                  value={inputs}
                  onChange={(e) => setInputs(e.target.value)}
                  placeholder="Your prompt will appear here..."
                />
              </Form.Group> */}
            </motion.div>
          )}
          {promptHistory.length > 0 && (
            <div 
              className="mt-4 p-4 border rounded shadow bg-light" 
              style={{ maxHeight: '400px', overflowY: 'auto' }}
              onClick={() => {
                // Fallback to localStorage since openDB is not defined
                const savedPrompts = localStorage.getItem('promptHistory');
                if (savedPrompts) {
                  setPromptHistory(JSON.parse(savedPrompts));
                }
              }}
            >
              <h6 className="mb-3">Recent Prompts:</h6>
              {promptHistory.map((prompt, index) => (
                <div key={index} className="mb-2 small position-relative">
                  <Button 
                    variant="link" 
                    className="position-absolute top-0 end-0 text-danger p-0" 
                    style={{ fontSize: '1.2rem' }}
                    onClick={async () => {
                      try {
                        const db = await openDB('promptGeneratorDB', 1);
                        const tx = db.transaction(['prompts'], 'readwrite');
                        const store = tx.objectStore('prompts');
                        await store.delete(prompt.timestamp);
                        await tx.done;
                        
                        // Update state after deletion
                        setPromptHistory(prev => prev.filter(p => p.timestamp !== prompt.timestamp));
                      } catch (error) {
                        console.error('Error deleting prompt:', error);
                      }
                    }}
                  >
                    ×
                  </Button>
                  <Badge bg="secondary" className="me-2">
                    {prompt?.type || 'Unknown'}
                  </Badge>
                  <span className="me-2">
                    {new Date(prompt.timestamp).toLocaleDateString()} {new Date(prompt.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="mt-1 p-2 border rounded">
                    <div className="text-muted small">Final Prompt:</div>
                    {prompt.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}


