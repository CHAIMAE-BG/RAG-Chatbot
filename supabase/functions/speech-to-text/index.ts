
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to process base64 chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  console.log(`Processing base64 string of length: ${base64String.length}`);
  
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
    console.log(`Processed chunk. Position: ${position}/${base64String.length}`);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  console.log(`Total processed audio size: ${result.length} bytes`);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Speech-to-text function called");
    
    const contentType = req.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (e) {
      console.error("Failed to parse request body:", e);
      throw new Error('Invalid JSON in request body');
    }

    const { audio } = requestBody;
    
    if (!audio) {
      console.error("No audio data provided");
      throw new Error('No audio data provided');
    }

    console.log(`Audio data received. Base64 length: ${audio.length}`);
    
    // Verify OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('Missing OpenAI API key');
      throw new Error('OpenAI API key not configured. Please contact administrator.');
    }
    console.log("OpenAI API key validated");
    
    // Process the audio by chunks
    console.log("Processing audio chunks...");
    const binaryAudio = processBase64Chunks(audio);
    console.log("Audio processed successfully");
    
    // Prepare form data for OpenAI API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    console.log("Form data prepared");

    // Send to OpenAI API
    console.log("Sending request to OpenAI...");
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    console.log("Received successful response from OpenAI");
    const result = await response.json();
    console.log('Transcription result:', result);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing speech to text:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
