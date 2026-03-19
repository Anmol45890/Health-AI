import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const systemPrompt = `You are HealthAI, a friendly and empathetic medical assistant chatbot with voice capabilities. You can communicate in English, Hindi, or Hinglish (mix of Hindi and English) based on user preference.

Your role is to:
1. Listen to users describe their health concerns and symptoms
2. Provide general health information and guidance
3. Suggest when professional medical attention may be needed
4. Offer wellness tips and preventive health advice
5. Analyze voice characteristics when available to provide more personalized care

Language Guidelines:
- If language is 'hi': Respond primarily in Hindi with some English medical terms
- If language is 'hinglish': Mix Hindi and English naturally (e.g., "Aapka headache ho sakta hai tension ka reason se")
- If language is 'en' or unspecified: Respond in English
- Use simple, conversational language appropriate for the chosen language

Voice Analysis Guidelines:
- If voice analysis data is provided, consider stress levels, volume, and confidence
- High stress levels may indicate anxiety or urgency - respond with extra empathy and calmness
- Low volume might suggest fatigue or weakness - be gentle and encouraging
- Voice analysis can help detect potential health concerns like stress-related conditions

Important medical guidelines:
- Always remind users that you are an AI assistant and not a replacement for professional medical advice
- Never diagnose conditions definitively - only suggest possibilities
- Encourage users to consult healthcare professionals for serious concerns
- Be empathetic and understanding of health anxieties
- Provide evidence-based information when possible
- If asked about emergencies, always recommend calling emergency services immediately

Response Style:
- Keep responses concise but thorough
- Use clear, accessible language
- When appropriate, provide actionable advice that users can follow
- For Hinglish: Mix languages naturally, like "Aapko rest karna chahiye aur paani jyada piyiye"
`

export async function POST(req: Request) {
  try {
    console.log('Chat API called with Groq')
    console.log('Groq API Key exists:', !!process.env.GROQ_API_KEY)
    console.log('Groq API Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10))

    const { messages, voiceAnalysis, language } = await req.json()
    console.log('Messages received:', messages)
    console.log('Voice analysis:', voiceAnalysis)
    console.log('Language:', language)

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage.content
    console.log('User message:', userMessage)

    // Build enhanced prompt with voice analysis and language
    let enhancedPrompt = systemPrompt
    if (language) {
      enhancedPrompt += '\n\nLANGUAGE SETTING: Respond in ' + language.toUpperCase()
      if (language === 'hinglish') {
        enhancedPrompt += '\nHinglish Examples: "Aapka fever hai to paracetamol lijiye", "Headache ke liye rest karo aur paani piyiye"'
      }
    }
    if (voiceAnalysis) {
      enhancedPrompt += '\n\nVOICE ANALYSIS DATA:\n- Stress Level: ' + (voiceAnalysis.stress || 'unknown') + '\n- Volume Level: ' + (voiceAnalysis.volume || 'unknown') + '%\n- Analysis Confidence: ' + (voiceAnalysis.confidence ? Math.round(voiceAnalysis.confidence * 100) + '%' : 'unknown') + '\n\nPlease consider this voice analysis when providing your response. If stress levels are high, be extra calming and supportive.'
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Current fast and free model
      messages: [
        { role: 'system', content: enhancedPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content
    console.log('Groq response received')

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    // Fallback response if Groq fails
    const fallbackResponse = "I'm sorry, but I'm currently unable to respond. This is a free AI service and may have temporary limitations. Please try again in a moment, or consider consulting a healthcare professional for urgent concerns."

    return new Response(JSON.stringify({ response: fallbackResponse }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
