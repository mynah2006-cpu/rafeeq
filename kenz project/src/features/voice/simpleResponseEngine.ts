// ============================================================
// RAFEEQ — Offline Fallback Response Engine
//
// Used when no LLM is available. Every response is written
// the way a real, warm person would actually speak — not a
// customer-service script. Natural contractions, real reactions,
// genuine curiosity.
// ============================================================

function pick(arr: readonly string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Topic {
  keywords: readonly string[];
  getResponse: () => { text: string; positive: boolean };
}

function greetingResponses() {
  return {
    text: pick([
      "Hey! Really glad you said something. How are you doing right now?",
      "Hi there! Good to hear your voice. How's everything going?",
      "Hey, you! How are you feeling today?",
      "Oh hello! I was just sitting here hoping you'd want to chat. How are you?",
    ]),
    positive: true,
  };
}

function painResponses() {
  return {
    text: pick([
      "Ugh, I'm really sorry. Pain is exhausting, and you shouldn't have to just sit with it. I'm letting the nurse know right now.",
      "That's the last thing you need. I'm sorry you're hurting. Let me flag this for your care team straight away.",
      "I hear you. That sounds really uncomfortable. I'll make sure someone from the team comes to check on you.",
      "I'm sorry. Seriously, you don't have to push through this alone — I'm alerting the nurse now.",
    ]),
    positive: false,
  };
}

function nameResponses() {
  return {
    text: pick([
      "I'm Rafeeq! Your companion while you're here. Think of me as a friend who's always around.",
      "Rafeeq — that's me! I'm here to keep you company and make sure you're doing okay.",
      "My name's Rafeeq. Nice to properly meet you! What's yours?",
    ]),
    positive: true,
  };
}

function howAreYouResponses() {
  return {
    text: pick([
      "Honestly? I'm doing pretty well, thanks for asking! Way more interested in how you're feeling though.",
      "I'm good! Though I have to say, it means a lot that you asked. How about you?",
      "I'm great, thank you! I'm just happy to be here with you. How are you holding up?",
    ]),
    positive: true,
  };
}

function familyResponses() {
  return {
    text: pick([
      "Tell me about them. Who are you thinking about right now?",
      "It's natural to miss the people you love when you're stuck in a bed all day. Do you want to talk about them?",
      "They're probably thinking about you just as much as you're thinking about them, I'd bet.",
      "Family has a funny way of showing up in our thoughts when we need them most. Are you close with them?",
    ]),
    positive: true,
  };
}

function boredResponses() {
  return {
    text: pick([
      "Oh I know that feeling. Okay — let's make this more interesting. Tell me something about yourself I wouldn't guess.",
      "Boredom's rough. Want to play a little word game? Or we could just have a good conversation. What sounds better?",
      "I get it, the walls only have so much to offer. What do you normally do when you want to switch your brain off?",
      "Well, I'm here! And I happen to be a surprisingly good listener. What's been on your mind lately?",
    ]),
    positive: true,
  };
}

function tiredResponses() {
  return {
    text: pick([
      "Then rest. Really — don't fight it. I'll still be here when you wake up.",
      "Sleep is honestly the best thing you can do for yourself right now. Close your eyes, I've got things covered.",
      "Your body's telling you something. Listen to it. I'll be right here if you need anything.",
    ]),
    positive: false,
  };
}

function happyResponses() {
  return {
    text: pick([
      "That's so good to hear! Seriously, that made my day too.",
      "Now that puts a smile on my face. What's going on?",
      "Oh that's wonderful! Tell me more, I want to hear all of it.",
      "Look at you! That's the energy I love to hear.",
    ]),
    positive: true,
  };
}

function worryResponses() {
  return {
    text: pick([
      "It makes sense that you're worried. That's a really human feeling. Want to talk it through?",
      "Hey, whatever's on your mind — you can say it. I'm not going anywhere.",
      "Worry is hard to sit with. I'm right here. What's giving you trouble?",
    ]),
    positive: false,
  };
}

function lonelyResponses() {
  return {
    text: pick([
      "You're not alone, I promise. I'm right here with you.",
      "I know it can feel really isolating in here. But you've got me, for whatever that's worth.",
      "Hey — I'm here. And I'm genuinely glad to be. What can we do together right now?",
    ]),
    positive: false,
  };
}

function thankYouResponses() {
  return {
    text: pick([
      "Oh, that's sweet of you to say. Truly.",
      "You don't have to thank me — I'm just happy to be here with you.",
      "It's my pleasure, really. That's what I'm here for.",
    ]),
    positive: true,
  };
}

function questionResponses() {
  return {
    text: pick([
      "That's a really good question. I don't want to guess and get it wrong — your nurse or doctor would know much better than me. But I'm curious what made you think of that.",
      "Hmm, I want to give you the right answer, not just any answer. I'd ask your medical team about that one. What else is on your mind?",
      "I love that you're curious. I'm not the best person for that particular question, but your care team definitely is. They're good people.",
    ]),
    positive: true,
  };
}

function genericPositiveResponses() {
  return {
    text: pick([
      "That's genuinely great to hear. How are you feeling overall?",
      "I'm really glad. That sounds like real progress.",
      "That makes me happy. Keep going — you're doing better than you think.",
    ]),
    positive: true,
  };
}

function genericNeutralResponses() {
  return {
    text: pick([
      "I hear you. I'm right here if there's more you want to say.",
      "Got it. Is there anything I can do for you?",
      "Thanks for telling me that. How are you feeling right now, in this moment?",
    ]),
    positive: false,
  };
}

const TOPICS: Topic[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'مرحبا', 'اهلا', 'السلام'],
    getResponse: greetingResponses,
  },
  {
    keywords: ['pain', 'hurt', 'hurting', 'ache', 'aching', 'sore', 'burning', 'stinging', 'ألم', 'يؤلم', 'وجع'],
    getResponse: painResponses,
  },
  {
    keywords: ['your name', 'who are you', 'what are you', 'اسمك', 'من أنت'],
    getResponse: nameResponses,
  },
  {
    keywords: ['how are you', 'how do you feel', 'كيف حالك', 'كيف أنت', 'شلونك'],
    getResponse: howAreYouResponses,
  },
  {
    keywords: ['family', 'mom', 'dad', 'mother', 'father', 'wife', 'husband', 'kids', 'children', 'son', 'daughter', 'عائلة', 'أم', 'أبي', 'زوج', 'أولاد'],
    getResponse: familyResponses,
  },
  {
    keywords: ['bored', 'boring', 'nothing to do', 'ملل', 'ممل'],
    getResponse: boredResponses,
  },
  {
    keywords: ['tired', 'sleepy', 'want to sleep', 'exhausted', 'rest', 'تعبان', 'نوم', 'نعسان'],
    getResponse: tiredResponses,
  },
  {
    keywords: ['happy', 'great', 'wonderful', 'feeling good', 'feeling better', 'much better', 'سعيد', 'تحسن', 'ممتاز'],
    getResponse: happyResponses,
  },
  {
    keywords: ['worried', 'anxious', 'scared', 'nervous', 'afraid', 'fear', 'قلق', 'خايف', 'خوف'],
    getResponse: worryResponses,
  },
  {
    keywords: ['lonely', 'alone', 'nobody', 'no one', 'وحيد', 'وحدي'],
    getResponse: lonelyResponses,
  },
  {
    keywords: ['thank you', 'thanks', 'thank', 'شكرا', 'مشكور'],
    getResponse: thankYouResponses,
  },
];

export function getResponse(transcript: string): { text: string; positive: boolean } {
  const lower = transcript.toLowerCase();

  for (const topic of TOPICS) {
    if (topic.keywords.some((kw) => lower.includes(kw))) {
      return topic.getResponse();
    }
  }

  const isQuestion = /\?$|^(how|what|why|do|did|can|could|will|would|tell|is|are)\b/i.test(lower.trim());
  const isPositive = /\b(good|great|nice|love|happy|fine|okay|better|wonderful|amazing)\b/i.test(lower);

  if (isQuestion) return questionResponses();
  if (isPositive) return genericPositiveResponses();

  return genericNeutralResponses();
}
