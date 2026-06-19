// ─── Sentiment Engine — consumer comments dataset ─────────────────────────────
// Original 5 (structured, keyword-mapped)
// + 10 human-style comments generated for richer demo coverage
// Load this file before the page script so COMMENTS is available globally.

const COMMENTS = [
  // ── Original 5 ──────────────────────────────────────────────────────────────
  {
    id: 1,
    text: "I love the glass-skin look but niacinamide breaks me out, I wish there was something cleaner that plumps skin"
  },
  {
    id: 2,
    text: "Slugging with petroleum jelly is too heavy, I want something that locks moisture without the greasy feel"
  },
  {
    id: 3,
    text: "Looking for a reef-safe SPF that doesn't leave a white cast on dark skin tones"
  },
  {
    id: 4,
    text: "Retinol is too harsh for my sensitive skin, what gives similar anti-aging results?"
  },
  {
    id: 5,
    text: "I want the dewy K-beauty look without 10 steps, something that does it all in one"
  },

  // ── Human-style comments (generated) ────────────────────────────────────────
  {
    id: 6,
    text: "ok so why does every 'lightweight' sunscreen still leave me looking like a glazed donut?? i have oily skin i cannot be out here looking greasy AND getting sun damage at the same time lol someone please help"
  },
  {
    id: 7,
    text: "genuinely starting to think my skin is just broken. ive tried like 6 different serums with that ingredient everyone on here swears by and my face is STILL dull and congested like... what am i doing wrong?? do i need to layer them differently or smth"
  },
  {
    id: 8,
    text: "ugh i just want ONE product that actually does what it says. moisturizer says 'plumping' but my fine lines are still very much here and very much thriving 😭 i'm only 28 this should not be my life rn"
  },
  {
    id: 9,
    text: "hot take but the whole 10-step routine thing is NOT it for me. my skin got so much worse when i started adding more stuff. now i'm trying to go back to basics but idk what to actually keep vs cut, it's so overwhelming tbh"
  },
  {
    id: 10,
    text: "can someone explain why my moisturizer pills under makeup EVERY single time?? i wait the full 10 min for it to absorb and it still does it. is it the formula?? my primer?? my life choices?? asking for a friend (the friend is me)"
  },
  {
    id: 11,
    text: "literally just found out half my skincare has ingredients that aren't great for the environment and now i feel guilty every time i wash my face. why is it so hard to find stuff that actually works AND doesn't have a sketchy ingredient list 😤"
  },
  {
    id: 12,
    text: "my dark spots from last year's breakouts are still HERE and i've been consistent for 4 months. at what point do i just accept my hyperpigmentation is permanent lmaooo no but seriously what actually works for this kind of thing"
  },
  {
    id: 13,
    text: "omg finally found a barrier cream that doesn't break me out BUT it smells kind of weird and the texture is a little tacky and honestly i'm still not sure if my redness is getting better or if i've just gotten used to looking like a tomato"
  },
  {
    id: 14,
    text: "why do all the 'sensitive skin approved' products still make my face sting?? like i check every ingredient, patch test religiously, and yet here we are. is my skin actually just allergic to skincare at this point 😭😭"
  },
  {
    id: 15,
    text: "ok so i'm in my 40s and everyone keeps saying to start using the stronger anti-aging stuff but every time i try it i peel and get irritated for like 2 weeks. is there like... a gentler way to actually get results or do i just have to suffer through it"
  }
];
