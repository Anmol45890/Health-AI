import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
    })

    res.status(200).json({ response: completion.choices[0].message.content })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'Failed to get response from OpenAI' })
  }
}