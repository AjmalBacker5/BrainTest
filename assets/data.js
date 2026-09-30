/* ==========================================================================
   MindBearing: test content, scoring and helplines.
   Add a new check by adding one object to TESTS. See README.md.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Answer scales: [label, points] ---------- */
  var S = {
    phq: [["Not at all", 0], ["Several days", 1], ["More than half the days", 2], ["Nearly every day", 3]],
    youth: [["Not at all", 0], ["A few days", 1], ["More than half the days", 2], ["Nearly every day", 3]],
    f5: [["Never", 0], ["Rarely", 1], ["Sometimes", 2], ["Often", 3], ["Very often", 4]],
    yn: [["No", 0], ["Yes", 1]],
    psc: [["Never", 0], ["Sometimes", 1], ["Often", 2]],
    agree: [["Strongly disagree", 0], ["Disagree", 1], ["Neutral", 2], ["Agree", 3], ["Strongly agree", 4]],
    psy: [["No", 0], ["Yes, but it didn’t bother me", 1], ["Yes, and it bothered me a little", 2], ["Yes, and it bothered me a lot", 3]]
  };
  function opts(labels) { return labels.map(function (l, i) { return [l, i]; }); }

  /* ---------- Zodiac data for the astrology test (entertainment only) ---------- */
  var ZODIAC = [
    { name: "Aries", sym: "♈", dates: "21 Mar – 19 Apr", element: "Fire", planet: "Mars", traits: "bold, energetic, direct and quick to act",
      strength: "Aries brings courage and initiative. When something needs to get moving, Aries is usually the one who starts it.",
      growth: "Patience isn’t always the strong suit here. Slowing down before reacting can save some backtracking.",
      matches: "Leo, Sagittarius and Gemini." },
    { name: "Taurus", sym: "♉", dates: "20 Apr – 20 May", element: "Earth", planet: "Venus", traits: "steady, loyal and grounded, with a love of comfort",
      strength: "Taurus brings reliability and follow-through. Once committed, Taurus rarely gives up.",
      growth: "Routine can turn into rigidity. Trying something unfamiliar now and then keeps things fresh.",
      matches: "Virgo, Capricorn and Cancer." },
    { name: "Gemini", sym: "♊", dates: "21 May – 20 Jun", element: "Air", planet: "Mercury", traits: "curious, quick-witted and endlessly chatty",
      strength: "Gemini brings adaptability and sharp communication, and can hold a conversation about almost anything.",
      growth: "Following one thing through to the end can be harder than starting it. Fewer things, more finished.",
      matches: "Libra, Aquarius and Aries." },
    { name: "Cancer", sym: "♋", dates: "21 Jun – 22 Jul", element: "Water", planet: "the Moon", traits: "nurturing, intuitive and deeply loyal",
      strength: "Cancer brings warmth and emotional intelligence, and makes the people around them feel looked after.",
      growth: "Taking things personally is a common trap. Not every reaction from someone else is about you.",
      matches: "Scorpio, Pisces and Taurus." },
    { name: "Leo", sym: "♌", dates: "23 Jul – 22 Aug", element: "Fire", planet: "the Sun", traits: "confident, generous and naturally warm",
      strength: "Leo brings energy and leadership, and a genuine wish to see the people around them do well.",
      growth: "Sharing attention doesn’t always come easily. Making room for someone else to shine builds trust.",
      matches: "Aries, Sagittarius and Libra." },
    { name: "Virgo", sym: "♍", dates: "23 Aug – 22 Sep", element: "Earth", planet: "Mercury", traits: "analytical, practical and detail-focused",
      strength: "Virgo brings precision and dependability, spotting what others miss and quietly fixing it.",
      growth: "The inner critic can be loud. Good enough is sometimes exactly that: good enough.",
      matches: "Taurus, Capricorn and Cancer." },
    { name: "Libra", sym: "♎", dates: "23 Sep – 22 Oct", element: "Air", planet: "Venus", traits: "diplomatic, fair-minded and socially graceful",
      strength: "Libra brings balance and charm, and a knack for seeing more than one side of an argument.",
      growth: "Weighing every option can turn into indecision. A good-enough choice made now often beats the perfect one made late.",
      matches: "Gemini, Aquarius and Leo." },
    { name: "Scorpio", sym: "♏", dates: "23 Oct – 21 Nov", element: "Water", planet: "Pluto and Mars", traits: "intense, passionate and fiercely private",
      strength: "Scorpio brings focus and depth, and doesn’t do anything by halves.",
      growth: "Trust can take a long time to give. Letting people in a little earlier tends to pay off.",
      matches: "Cancer, Pisces and Virgo." },
    { name: "Sagittarius", sym: "♐", dates: "22 Nov – 21 Dec", element: "Fire", planet: "Jupiter", traits: "adventurous, optimistic and refreshingly honest",
      strength: "Sagittarius brings enthusiasm and a wide view, and rarely lets fear of failure stop them trying.",
      growth: "Bluntness can land harder than intended. A little tact goes a long way without losing the honesty.",
      matches: "Aries, Leo and Aquarius." },
    { name: "Capricorn", sym: "♑", dates: "22 Dec – 19 Jan", element: "Earth", planet: "Saturn", traits: "disciplined, ambitious and patient",
      strength: "Capricorn brings drive and follow-through, and plays the long game better than most.",
      growth: "Downtime can feel unearned. Rest without guilt is worth practising.",
      matches: "Taurus, Virgo and Scorpio." },
    { name: "Aquarius", sym: "♒", dates: "20 Jan – 18 Feb", element: "Air", planet: "Uranus and Saturn", traits: "independent, inventive and a little unconventional",
      strength: "Aquarius brings original thinking and a strong sense of fairness for the wider group, not just themselves.",
      growth: "Emotional closeness can feel exposing. Letting people see more than the ideas sometimes deepens a relationship.",
      matches: "Gemini, Libra and Sagittarius." },
    { name: "Pisces", sym: "♓", dates: "19 Feb – 20 Mar", element: "Water", planet: "Neptune and Jupiter", traits: "imaginative, compassionate and quietly artistic",
      strength: "Pisces brings empathy and creativity, and often senses what others are feeling before they say it.",
      growth: "Escaping into daydreams is easier than facing what’s in front of you. Small, concrete steps help more than big leaps.",
      matches: "Cancer, Scorpio and Taurus." }
  ];
  var ELEMENT_TAKE = {
    Fire: { Fire: "That lines up with your sign’s own fire, so this probably feels natural rather than a stretch.", Earth: "Fire meeting your pull toward earth is a good mix: earth can give your energy something solid to land on.", Air: "Fire and air feed each other well. Air tends to fan your energy rather than compete with it.", Water: "Fire and water is a classic push and pull: water can cool a fast-moving fire sign, which isn’t a bad thing in small doses." },
    Earth: { Fire: "Earth meeting a pull toward fire adds some spark to your usual steadiness. It can push you to move faster than you’re used to.", Earth: "That matches your sign’s own earth, so steady and grounded probably feels like home.", Air: "Earth and air is an interesting pairing: air can loosen up an earth sign’s routines a little.", Water: "Earth and water tend to support each other. Water softens earth’s edges, and earth gives water something to hold onto." },
    Air: { Fire: "Air and fire feed each other well. Fire tends to give your ideas somewhere to go.", Earth: "Air meeting a pull toward earth can ground some of your bigger ideas into something workable.", Air: "That matches your sign’s own air, so thinking and talking things through probably comes easily.", Water: "Air and water don’t always mix simply: water runs on feeling, air runs on thinking, so this pairing can teach you a lot about the other side." },
    Water: { Fire: "Water and fire is a classic push and pull: fire can bring some heat to your usual depth.", Earth: "Water and earth tend to support each other. Earth gives your feelings somewhere steady to rest.", Air: "Water meeting a pull toward air can help you put words to what you’re feeling, which doesn’t always come naturally to water signs.", Water: "That matches your sign’s own water, so leading with feeling probably comes naturally." }
  };
  var TOPIC_TAKE = {
    Fire: { love: "In relationships, fire signs tend to lead with honesty and go after what they want. The challenge is usually patience once the early spark settles.", career: "At work, fire signs do well when they can take initiative and see quick results. Long waits for recognition can wear on you.", friends: "As a friend, fire signs bring energy and loyalty, and are usually the one pushing the group to actually do the thing.", self: "For self-understanding, the big question for fire signs is often what happens in the quiet moments, not just the exciting ones." },
    Earth: { love: "In relationships, earth signs show love through steady, practical care more than big declarations. Trust builds slowly and holds firm once it’s there.", career: "At work, earth signs do well with clear structure and visible progress. Chaos and last-minute changes are usually the hardest part.", friends: "As a friend, earth signs are the reliable ones: the person who actually shows up. Let them know that’s noticed.", self: "For self-understanding, earth signs often benefit from asking whether they’re resting because they need to, or because rest feels like the only thing they’re allowed to do once everything’s in order." },
    Air: { love: "In relationships, air signs connect through conversation and shared ideas. Emotional silence can feel more unsettling than conflict.", career: "At work, air signs do well with variety and people contact. Repetitive, isolated tasks tend to drain you fastest.", friends: "As a friend, air signs are easy to talk to and quick to introduce people to each other. Depth can take longer to build than breadth.", self: "For self-understanding, it can help to ask whether you’re actually feeling something, or just thinking about how it would feel." },
    Water: { love: "In relationships, water signs feel things deeply and pick up on what’s unsaid. The risk is absorbing more of someone else’s mood than is yours to carry.", career: "At work, water signs often do best in roles with meaning and human contact, though they can take criticism harder than it’s usually meant.", friends: "As a friend, water signs are the ones people go to when something’s actually wrong. Make sure that goes both ways.", self: "For self-understanding, water signs benefit from naming a feeling plainly, rather than letting it stay as a mood in the background." }
  };

  var CRISIS_Q = "You told us you have had thoughts of hurting yourself or that you would be better off dead. You deserve support right now. Please contact a crisis line below or someone you trust today. If you might act on these thoughts, call your local emergency number.";

  /* ---------- Small SVG helpers for the IQ test ---------- */
  function arrow(a, size) {
    size = size || 56;
    return '<svg viewBox="0 0 60 60" width="' + size + '" height="' + size + '" aria-hidden="true"><g transform="rotate(' + a + ' 30 30)"><path d="M30 8 L44 26 H35 V52 H25 V26 H16 Z" fill="currentColor"/></g></svg>';
  }
  function shape(kind, x, y) {
    if (kind === "c") return '<circle cx="' + x + '" cy="' + y + '" r="7" fill="currentColor"/>';
    if (kind === "s") return '<rect x="' + (x - 7) + '" y="' + (y - 7) + '" width="14" height="14" rx="2" fill="currentColor"/>';
    return '<path d="M' + x + ' ' + (y - 8) + ' L' + (x + 8) + ' ' + (y + 7) + ' L' + (x - 8) + ' ' + (y + 7) + ' Z" fill="currentColor"/>';
  }
  function cell(kind, n, size) {
    size = size || 64;
    var xs = n === 1 ? [30] : n === 2 ? [20, 40] : [12, 30, 48];
    var inner = xs.map(function (x) { return shape(kind, x, 30); }).join("");
    return '<svg viewBox="0 0 60 60" width="' + size + '" height="' + size + '" aria-hidden="true">' + inner + "</svg>";
  }
  function arrowRow() {
    return '<div class="seq">' + [0, 45, 90, 135].map(function (a) { return '<span class="seq-cell">' + arrow(a) + "</span>"; }).join("") + '<span class="seq-cell seq-q">?</span></div>';
  }
  function matrix() {
    var kinds = ["c", "s", "t"], out = "";
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
      out += (r === 2 && c === 2) ? '<span class="mx-cell seq-q">?</span>' : '<span class="mx-cell">' + cell(kinds[r], c + 1) + "</span>";
    }
    return '<div class="mx">' + out + "</div>";
  }

  /* ---------- Groups shown on the home page ---------- */
  window.GROUPS = [
    { id: "wellbeing", slug: "wellbeing-tests", name: "General wellbeing", accent: "#1c7a74",
      desc: "Overall mental health, stress, burnout and sleep.",
      long: "Start here if you know something feels off but not what it is. These checks look at your overall state, the pressure you are under, and the sleep that everything else depends on." },
    { id: "mood", slug: "mood-tests", name: "Mood", accent: "#7a4bbd",
      desc: "Low mood, highs and lows, and life with a new baby.",
      long: "Mood conditions are among the most common and the most treatable mental health problems. These checks look at how long your mood has been low, whether it swings, and how you are coping after having a baby." },
    { id: "worry", slug: "anxiety-tests", name: "Anxiety and fear", accent: "#2a6f97",
      desc: "Anxiety, social fear, intrusive thoughts and trauma.",
      long: "Worry becomes a problem when it stops you doing things or will not switch off. These checks cover everyday anxiety, fear of being judged, unwanted thoughts and rituals, and reactions that follow a traumatic event." },
    { id: "mind", slug: "attention-and-perception-tests", name: "Attention and perception", accent: "#b5651d",
      desc: "Focus, restlessness and unusual experiences.",
      long: "How your attention works, and how you experience the world around you. These checks look at the difficulties with focus and restlessness seen in ADHD, and at unusual experiences that can be early signs of psychosis." },
    { id: "habits", slug: "habits-and-body-tests", name: "Habits and body", accent: "#a3294e",
      desc: "Substances, gambling, food, body image and screens.",
      long: "Habits turn into problems when they take more than they give. These checks look at alcohol and drugs, gambling, your relationship with food and your body, and the pull of your phone." },
    { id: "self", slug: "self-and-relationships-tests", name: "Self and relationships", accent: "#3d7a4d",
      desc: "Self-esteem, loneliness, anger and your relationship.",
      long: "How you treat yourself, and how things are going with the people around you. These checks cover the way you talk to yourself, feeling alone, a temper that runs hot, and the health of your relationship." },
    { id: "personality", slug: "personality-tests", name: "Personality", accent: "#6a2c63",
      desc: "Your traits, emotional skills and social energy.",
      long: "No scores to worry about here. These tests describe how you are wired rather than what might be wrong, using the traits psychologists use to describe personality." },
    { id: "brain", slug: "iq-and-brain-tests", name: "IQ and brain tests", accent: "#3b5bdb",
      desc: "Reasoning puzzles with an estimated score.",
      long: "Timed puzzles that measure how you reason with numbers, words, logic and shapes. They are for curiosity and practice, not a clinical assessment." },
    { id: "young", slug: "tests-for-young-people", name: "Young people", accent: "#157a86",
      desc: "For teens, and for parents worried about a child.",
      long: "One check written in plain language for people aged 11 to 17, and one for parents answering about a child aged 4 to 16." },
    { id: "survey", slug: "surveys", name: "Surveys", accent: "#8a2d5c",
      desc: "Reflect on your experiences. No score, just insights.",
      long: "These are not scored. You answer a set of questions and get personal reflections back, along with support options that fit what you shared." },
    { id: "fun", slug: "fun-tests", name: "Just for fun", accent: "#b8860b",
      desc: "Zodiac signs and other light-hearted personality fun.",
      long: "Not backed by science, but fun to explore. These are for entertainment, not a look at your mental health." }
  ];


  /* ---------- Checks ---------- */
  window.TESTS = [
    /* ===== Universal screening ===== */
    {
      slug: "mental-health-check", group: "wellbeing", kind: "check", minutes: 3,
      title: "Universal Mental Health Check",
      short: "A quick look across 12 areas of wellbeing, with suggestions for which full check to take next.",
      tags: "general screening overall wellbeing start",
      time: "the past 2 weeks",
      stem: "Over the past 2 weeks, how often have you been bothered by the following?",
      scale: "phq",
      items: [
        "Little interest or pleasure in doing things",
        "Feeling down, depressed, or hopeless",
        "Feeling nervous, anxious, or on edge",
        "Not being able to stop or control worrying",
        "Trouble focusing, staying organised or finishing what you start",
        "Periods of unusually high energy, needing much less sleep, or racing thoughts",
        "Unwanted thoughts that keep coming back, or urges to check, clean or count",
        "Upsetting memories, nightmares, or feeling constantly on guard after a stressful event",
        "Worry about food, weight or body shape that affects your day",
        "Drinking, using drugs or gambling more than you meant to",
        "Feeling very anxious or self-conscious around other people",
        "Hearing or seeing things others don’t, or feeling that people are against you",
        "Thoughts that you would be better off dead, or of hurting yourself in some way"
      ],
      bands: [[5, 0, "You seem to be doing okay", "Your answers show few signs of distress right now. Keep an eye on how you feel, and come back any time things change."],
              [12, 1, "Some areas may need attention", "A few of your answers suggest things have been harder lately. Look at the areas below to see where a full check could help."],
              [22, 2, "Several areas are affecting you", "Your answers suggest that several areas are affecting your daily life. Taking the full checks below and talking to a professional would be a good next step."],
              [39, 3, "You may be under significant strain", "Your answers suggest you are carrying a lot right now. Please consider reaching out to a doctor or mental health professional soon."]],
      subs: [
        { name: "Mood", items: [0, 1], cut: 3, link: "depression-test" },
        { name: "Anxiety", items: [2, 3], cut: 3, link: "anxiety-test" },
        { name: "Attention", items: [4], cut: 2, link: "adhd-test" },
        { name: "Highs and lows", items: [5], cut: 2, link: "bipolar-test" },
        { name: "Intrusive thoughts", items: [6], cut: 2, link: "ocd-test" },
        { name: "Trauma", items: [7], cut: 2, link: "ptsd-test" },
        { name: "Food and body", items: [8], cut: 2, link: "eating-disorder-test" },
        { name: "Substances and gambling", items: [9], cut: 2, link: "addiction-test" },
        { name: "Social worry", items: [10], cut: 2, link: "social-anxiety-test" },
        { name: "Unusual experiences", items: [11], cut: 1, link: "psychosis-test" }
      ],
      flags: [{ i: 12, min: 1, type: "crisis", text: CRISIS_Q }],
      source: "Items 1–4 and 13 are from the PHQ-2, GAD-2 and PHQ-9 (Spitzer, Williams, Kroenke and colleagues; free to reproduce). The remaining items were written for this site as brief pointers and are not a validated instrument."
    },

    /* ===== Mood ===== */
    {
      slug: "depression-test", group: "mood", kind: "check", minutes: 3,
      title: "Depression Test",
      short: "The PHQ-9, one of the most widely used depression questionnaires in the world.",
      tags: "depression sad low mood phq-9 phq9",
      stem: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
      scale: "phq",
      items: [
        "Little interest or pleasure in doing things",
        "Feeling down, depressed, or hopeless",
        "Trouble falling or staying asleep, or sleeping too much",
        "Feeling tired or having little energy",
        "Poor appetite or overeating",
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
        "Trouble concentrating on things, such as reading the newspaper or watching television",
        "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
        "Thoughts that you would be better off dead or of hurting yourself in some way"
      ],
      bands: [[4, 0, "Minimal signs of depression", "Your answers suggest minimal symptoms of depression. It’s still worth checking in with yourself from time to time."],
              [9, 1, "Mild signs of depression", "Your answers suggest mild symptoms. These can improve with rest, routine and support, but keep watching how you feel. If they last more than a few weeks, talk to a professional."],
              [14, 2, "Moderate signs of depression", "Your answers suggest moderate symptoms of depression. Depression is common and treatable. A doctor or mental health professional can help you find the right support."],
              [19, 3, "Moderately severe signs of depression", "Your answers suggest moderately severe symptoms. Please speak with a doctor or mental health professional soon. Treatment such as talking therapy, medication or both can make a real difference."],
              [27, 3, "Severe signs of depression", "Your answers suggest severe symptoms of depression. Please reach out to a doctor or mental health professional as soon as possible. You don’t have to go through this alone."]],
      flags: [{ i: 8, min: 1, type: "crisis", text: CRISIS_Q }],
      related: ["anxiety-test", "bipolar-test", "mental-health-check"],
      source: "Patient Health Questionnaire-9 (PHQ-9), developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute."
    },
    {
      slug: "bipolar-test", group: "mood", kind: "check", minutes: 3,
      title: "Bipolar Test",
      short: "Looks for past periods of unusually high energy or mood that can point to bipolar disorder.",
      tags: "bipolar mania manic hypomania mood swings",
      stem: "Has there ever been a period of time when you were not your usual self and…",
      scale: "yn",
      items: [
        "you felt so high, excited or hyper that other people noticed a change in you?",
        "you were so easily irritated that you snapped at people or picked fights?",
        "you felt far more confident or important than you normally do?",
        "you slept a lot less than usual but didn’t feel tired?",
        "you talked much more, or much faster, than usual?",
        "your thoughts raced so fast you couldn’t slow them down?",
        "you were so distracted that it was hard to stay on one task?",
        "you had far more energy and took on many more activities than usual?",
        "you did things that were risky or unusual for you, or that others thought were excessive?",
        "your spending got you or your family into difficulty?",
        { q: "Did several of these happen during the same period of time?", o: [["No", 0], ["Yes", 1], ["I didn’t answer yes to any", 2]], score: false },
        { q: "How much of a problem did these experiences cause you, for example with work, family, money or the law?", o: [["No problem", 0], ["A minor problem", 1], ["A moderate problem", 2], ["A serious problem", 3]], score: false }
      ],
      bands: [[2, 0, "Few signs of bipolar disorder", "You reported few experiences linked to bipolar disorder."],
              [6, 1, "Some possible signs of bipolar disorder", "You reported some experiences that can be linked to bipolar disorder. On their own they don’t mean you have it, but if they worry you, mention them to a doctor."],
              [9, 2, "Several signs of bipolar disorder", "You reported several experiences linked to bipolar disorder. It would be worth talking to a doctor or mental health professional about them."],
              [10, 3, "Strong signs of bipolar disorder", "You reported many experiences linked to bipolar disorder that happened together and caused real problems. Please talk to a doctor or psychiatrist. Bipolar disorder is very treatable with the right support."]],
      custom: function (res, ans) {
        var yes = res.score, same = ans[10] === 1, prob = ans[11] || 0, k;
        if (yes >= 7 && same && prob >= 2) k = 3;
        else if (yes >= 7 || (yes >= 5 && same)) k = 2;
        else if (yes >= 3) k = 1;
        else k = 0;
        res.bandIndex = k;
        return res;
      },
      next: ["If you have also had periods of low mood, mention both to a doctor. Antidepressants alone are not always suitable for people with bipolar disorder."],
      related: ["depression-test", "mental-health-check"],
      source: "Written for this site based on common features of mania and hypomania. This is not a validated instrument, and it cannot diagnose bipolar disorder."
    },
    {
      slug: "postpartum-depression-test", group: "mood", kind: "check", minutes: 3,
      title: "Postpartum Depression Test",
      short: "The Edinburgh Postnatal Depression Scale, for new and expecting parents.",
      tags: "postpartum postnatal perinatal pregnancy baby epds mother father parent",
      intro: "For anyone who is pregnant or has had a baby in the past year, including partners.",
      stem: "In the past 7 days…",
      items: [
        { q: "I have been able to laugh and see the funny side of things", o: [["As much as I always could", 0], ["Not quite so much now", 1], ["Definitely not so much now", 2], ["Not at all", 3]] },
        { q: "I have looked forward with enjoyment to things", o: [["As much as I ever did", 0], ["Rather less than I used to", 1], ["Definitely less than I used to", 2], ["Hardly at all", 3]] },
        { q: "I have blamed myself unnecessarily when things went wrong", o: [["Yes, most of the time", 3], ["Yes, some of the time", 2], ["Not very often", 1], ["No, never", 0]] },
        { q: "I have been anxious or worried for no good reason", o: [["No, not at all", 0], ["Hardly ever", 1], ["Yes, sometimes", 2], ["Yes, very often", 3]] },
        { q: "I have felt scared or panicky for no very good reason", o: [["Yes, quite a lot", 3], ["Yes, sometimes", 2], ["No, not much", 1], ["No, not at all", 0]] },
        { q: "Things have been getting on top of me", o: [["Yes, most of the time I haven’t been able to cope at all", 3], ["Yes, sometimes I haven’t been coping as well as usual", 2], ["No, most of the time I have coped quite well", 1], ["No, I have been coping as well as ever", 0]] },
        { q: "I have been so unhappy that I have had difficulty sleeping", o: [["Yes, most of the time", 3], ["Yes, sometimes", 2], ["Not very often", 1], ["No, not at all", 0]] },
        { q: "I have felt sad or miserable", o: [["Yes, most of the time", 3], ["Yes, quite often", 2], ["Not very often", 1], ["No, not at all", 0]] },
        { q: "I have been so unhappy that I have been crying", o: [["Yes, most of the time", 3], ["Yes, quite often", 2], ["Only occasionally", 1], ["No, never", 0]] },
        { q: "The thought of harming myself has occurred to me", o: [["Yes, quite often", 3], ["Sometimes", 2], ["Hardly ever", 1], ["Never", 0]] }
      ],
      bands: [[9, 0, "Few signs of perinatal depression", "Your answers suggest few symptoms of depression. Parenthood is demanding, so keep checking in with yourself."],
              [12, 2, "Possible perinatal depression", "Your answers suggest you may be experiencing depression. This is common during pregnancy and after birth, and it is not your fault. Please talk to your midwife, doctor or health visitor."],
              [30, 3, "Likely perinatal depression", "Your answers suggest you are likely experiencing depression. Please contact your doctor, midwife or health visitor soon. With support, most parents feel better."]],
      flags: [{ i: 9, min: 1, type: "crisis", text: "You said the thought of harming yourself has occurred to you. Please tell your doctor, midwife or someone you trust today, or contact a crisis line below. If you feel you might act on these thoughts, call your local emergency number." }],
      next: ["Partners and fathers can experience perinatal depression too. For partners, a score of 10 or more is worth discussing with a professional.", "Ask someone you trust to help with night feeds or chores so you can rest."],
      related: ["depression-test", "anxiety-test"],
      source: "Edinburgh Postnatal Depression Scale (EPDS). Cox, J.L., Holden, J.M., & Sagovsky, R. (1987). Detection of postnatal depression: Development of the 10-item Edinburgh Postnatal Depression Scale. British Journal of Psychiatry, 150, 782–786. Reproduced with acknowledgement of the authors and source, as the authors permit."
    },

    /* ===== Worry and fear ===== */
    {
      slug: "anxiety-test", group: "worry", kind: "check", minutes: 2,
      title: "Anxiety Test",
      short: "The GAD-7, a widely used check for generalised anxiety.",
      tags: "anxiety worry nervous panic gad-7 gad7 stress",
      stem: "Over the last 2 weeks, how often have you been bothered by the following problems?",
      scale: "phq",
      items: [
        "Feeling nervous, anxious, or on edge",
        "Not being able to stop or control worrying",
        "Worrying too much about different things",
        "Trouble relaxing",
        "Being so restless that it is hard to sit still",
        "Becoming easily annoyed or irritable",
        "Feeling afraid, as if something awful might happen"
      ],
      bands: [[4, 0, "Minimal anxiety", "Your answers suggest minimal anxiety. Some worry is a normal part of life."],
              [9, 1, "Mild anxiety", "Your answers suggest mild anxiety. Regular sleep, movement and slow breathing can help. If it continues or grows, talk to a professional."],
              [14, 2, "Moderate anxiety", "Your answers suggest moderate anxiety. Anxiety responds well to treatment, so consider speaking with a doctor or therapist."],
              [21, 3, "Severe anxiety", "Your answers suggest severe anxiety. Please reach out to a doctor or mental health professional soon. Effective treatments are available."]],
      related: ["social-anxiety-test", "ocd-test", "depression-test"],
      source: "Generalized Anxiety Disorder 7-item scale (GAD-7), developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute."
    },
    {
      slug: "social-anxiety-test", group: "worry", kind: "check", minutes: 3,
      title: "Social Anxiety Test",
      short: "Checks how much fear of judgement shapes your social life, study or work.",
      tags: "social anxiety shyness fear public speaking phobia",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "I’m afraid of being judged or embarrassed in front of others.",
        "I avoid parties, meetings or other social events.",
        "Talking to strangers or people in authority makes me very nervous.",
        "I worry for days or weeks before a social event.",
        "I avoid being the centre of attention.",
        "I fear people will notice signs of my nervousness, like blushing, sweating or shaking.",
        "Eating, writing or making calls in front of others makes me uncomfortable.",
        "After social situations, I replay what I said and criticise myself.",
        "I stay quiet in class or at work even when I have something to say.",
        "My fear of social situations limits my work, studies or relationships."
      ],
      bands: [[10, 0, "Few signs of social anxiety", "Your answers suggest social situations don’t cause you much distress."],
              [20, 1, "Mild social anxiety", "Your answers suggest some social anxiety. Gently facing situations you avoid, one small step at a time, often helps."],
              [30, 2, "Moderate social anxiety", "Your answers suggest social anxiety is limiting parts of your life. Cognitive behavioural therapy (CBT) is very effective for this."],
              [40, 3, "Severe social anxiety", "Your answers suggest social anxiety is having a big impact on your life. Please consider speaking with a doctor or therapist."]],
      related: ["anxiety-test", "depression-test"],
      source: "Written for this site based on common features of social anxiety disorder. This is not a validated instrument."
    },
    {
      slug: "ocd-test", group: "worry", kind: "check", minutes: 3,
      title: "OCD Test",
      short: "Looks at intrusive thoughts, rituals and how much time they take up.",
      tags: "ocd obsessive compulsive intrusive thoughts checking cleaning",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "Unwanted thoughts, images or urges pop into my mind and upset me.",
        "I worry that I might harm someone by accident or through carelessness.",
        "I feel I must wash or clean more than seems reasonable.",
        "I check things like locks, appliances or messages again and again.",
        "Things have to be ordered, arranged or “just right” or I feel very uneasy.",
        "I repeat actions, words or counting until it feels right.",
        "I work hard to push away or cancel out certain thoughts.",
        "I avoid places, people or objects because they trigger my worries.",
        "These thoughts or rituals take up more than an hour of my day.",
        "My thoughts or rituals get in the way of work, study or relationships."
      ],
      bands: [[10, 0, "Few signs of OCD", "Your answers show few signs of obsessive-compulsive symptoms. Most people have odd or unwanted thoughts now and then."],
              [20, 1, "Mild signs of OCD", "Your answers suggest some obsessive-compulsive symptoms. If they are taking up your time or causing distress, a professional can help."],
              [30, 2, "Moderate signs of OCD", "Your answers suggest obsessive-compulsive symptoms are affecting your life. A form of CBT called exposure and response prevention (ERP) works well for OCD."],
              [40, 3, "Severe signs of OCD", "Your answers suggest significant obsessive-compulsive symptoms. Please talk to a doctor or a therapist experienced in OCD."]],
      related: ["anxiety-test", "mental-health-check"],
      source: "Written for this site based on common features of obsessive-compulsive disorder. This is not a validated instrument."
    },
    {
      slug: "ptsd-test", group: "worry", kind: "check", minutes: 2,
      title: "PTSD Test",
      short: "The PC-PTSD-5, a short check used by the US Department of Veterans Affairs.",
      tags: "ptsd trauma post traumatic stress flashbacks nightmares",
      intro: "Some of these questions ask about traumatic events. You can stop at any time.",
      stem: "In the past month, have you…",
      scale: "yn",
      items: [
        { q: "Sometimes things happen to people that are unusually or especially frightening, horrible, or traumatic. For example: a serious accident or fire; a physical or sexual assault or abuse; an earthquake or flood; a war; seeing someone be killed or seriously injured; having a loved one die through homicide or suicide. Have you ever experienced this kind of event?", stem: "Before we begin", o: [["Yes", 1], ["No", 0, "end"]], score: false },
        "had nightmares about the event(s) or thought about the event(s) when you did not want to?",
        "tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?",
        "been constantly on guard, watchful, or easily startled?",
        "felt numb or detached from people, activities, or your surroundings?",
        "felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?"
      ],
      bands: [[1, 0, "Few signs of PTSD", "Your answers show few signs of post-traumatic stress."],
              [2, 1, "Some signs of trauma-related stress", "You reported some reactions that are common after trauma. If they continue or get worse, a professional can help."],
              [3, 2, "Possible PTSD", "Your answers suggest you may have post-traumatic stress disorder. Please consider speaking with a doctor or trauma-informed therapist."],
              [5, 3, "Likely PTSD", "Your answers suggest you are likely experiencing post-traumatic stress disorder. Trauma-focused therapies work well. Please reach out to a professional."]],
      custom: function (res, ans) {
        if (ans[0] === 1) {
          res.band = { tone: 0, label: "No traumatic event reported", text: "You told us you haven’t experienced this kind of event, so this check doesn’t apply right now. If something happens in the future, you can come back any time." };
        }
        return res;
      },
      related: ["anxiety-test", "depression-test"],
      source: "Primary Care PTSD Screen for DSM-5 (PC-PTSD-5). Prins, A., Bovin, M.J., Kimerling, R., et al. (2016). National Center for PTSD, US Department of Veterans Affairs. Public domain."
    },

    /* ===== Focus and thinking ===== */
    {
      slug: "adhd-test", group: "mind", kind: "check", minutes: 4,
      title: "ADHD Test",
      short: "An adult check for attention, restlessness and impulsivity.",
      tags: "adhd add attention focus hyperactive adult",
      intro: "For adults. Think about how you’ve been over the past 6 months, at home, work or study.",
      stem: "Over the past 6 months, how often has this been true for you?",
      scale: "f5",
      items: [
        "I make careless mistakes because I miss details.",
        "I find it hard to keep my attention on long tasks, conversations or reading.",
        "My mind wanders even when someone is speaking directly to me.",
        "I start tasks but lose focus and leave them unfinished.",
        "Organising my tasks, time and belongings is a struggle.",
        "I put off tasks that need a lot of mental effort.",
        "I lose things I need, like keys, phone or documents.",
        "Noises, notifications or unrelated thoughts pull me away easily.",
        "I forget appointments, bills or everyday responsibilities.",
        "I fidget, tap or feel restless when I have to sit still.",
        "I feel driven, as if I can’t switch off or slow down.",
        "I talk a lot, or finish other people’s sentences.",
        "Waiting my turn feels very hard.",
        "I interrupt others or act before thinking things through."
      ],
      bands: [[16, 0, "Few signs of ADHD", "Your answers show few signs of ADHD. Everyone is distracted or restless sometimes."],
              [28, 1, "Some signs of ADHD", "You reported some attention or restlessness difficulties. Sleep, stress and low mood can also cause these."],
              [40, 2, "Many signs of ADHD", "Your answers suggest attention or restlessness difficulties that are worth exploring. A doctor or psychologist can do a full assessment."],
              [56, 3, "Strong signs of ADHD", "Your answers suggest strong signs of ADHD. Consider asking a doctor about a formal assessment. ADHD in adults is common and manageable."]],
      subs: [
        { name: "Inattention", items: [0, 1, 2, 3, 4, 5, 6, 7, 8], cut: 22 },
        { name: "Hyperactivity and impulsivity", items: [9, 10, 11, 12, 13], cut: 12 }
      ],
      next: ["ADHD usually starts in childhood. Think about whether you had similar difficulties as a child, and bring examples to an assessment."],
      related: ["mental-health-check", "iq-test"],
      source: "Written for this site based on the symptom areas described in DSM-5 for ADHD. This is not a validated instrument, and only a qualified clinician can diagnose ADHD."
    },
    {
      slug: "psychosis-test", group: "mind", kind: "check", minutes: 3,
      title: "Psychosis & Schizophrenia Test",
      short: "Checks for unusual experiences that can be early signs of psychosis.",
      tags: "psychosis schizophrenia voices hallucinations paranoia delusions",
      stem: "In the past month…",
      scale: "psy",
      items: [
        "Did familiar places or people ever seem strange, unreal or changed?",
        "Did you hear sounds or voices that other people didn’t seem to hear?",
        "Did you see things that other people couldn’t see?",
        "Did you feel that people were watching you or talking about you?",
        "Did you feel your thoughts were being controlled, or put into your head, by something outside you?",
        "Did you feel that someone wanted to harm you, without a clear reason?",
        "Were your thoughts so jumbled that it was hard to make sense or communicate?",
        "Did you feel you had special powers, or a special mission others couldn’t understand?",
        "Did everyday things like songs, signs or TV seem to carry hidden messages meant for you?",
        "Did you lose interest in people and pull away from them more than usual?"
      ],
      bands: [[5, 0, "Few signs of psychosis", "You reported few unusual experiences. Many people have an odd experience now and then, especially when tired or stressed."],
              [12, 2, "Some possible early signs of psychosis", "You reported some unusual experiences that are worth mentioning to a doctor, especially if they are new or getting stronger."],
              [30, 3, "Signs that need prompt attention", "You reported several unusual experiences that are causing you distress. Please speak with a doctor or mental health service soon. Early support leads to better outcomes."]],
      next: ["Lack of sleep, stress, cannabis and other drugs can trigger or worsen these experiences.", "Many regions have early intervention in psychosis services. Ask your doctor about them."],
      related: ["bipolar-test", "mental-health-check"],
      source: "Written for this site based on common early features of psychosis. This is not a validated instrument."
    },
    {
      slug: "iq-test", group: "brain", kind: "iq", minutes: 15, estimate: true,
      title: "IQ Test",
      short: "20 puzzles covering numbers, words, logic and shapes, with an estimated score.",
      tags: "iq intelligence brain puzzles logic reasoning cognitive",
      intro: "You have 15 minutes. Answer as many as you can. You can skip back to change an answer.",
      limit: 900,
      items: [
        { cat: "Numerical", q: "What number comes next? 2, 6, 12, 20, 30, …", o: ["40", "42", "44", "36"], a: 1 },
        { cat: "Numerical", q: "What number comes next? 3, 9, 27, 81, …", o: ["162", "216", "243", "324"], a: 2 },
        { cat: "Verbal", q: "Book is to reading as fork is to…", o: ["drawing", "eating", "writing", "stirring"], a: 1 },
        { cat: "Numerical", q: "What number comes next? 1, 1, 2, 3, 5, 8, …", o: ["11", "12", "15", "13"], a: 3 },
        { cat: "Logical", q: "All bloops are razzies. All razzies are lazzies. Are all bloops definitely lazzies?", o: ["Yes", "No", "Only some", "It can’t be known"], a: 0 },
        { cat: "Verbal", q: "Which word does not belong?", o: ["Apple", "Carrot", "Banana", "Mango"], a: 1 },
        { cat: "Numerical", q: "What number comes next? 7, 10, 8, 11, 9, 12, …", o: ["13", "10", "8", "11"], a: 1 },
        { cat: "Spatial", q: "Which arrow comes next in the sequence?", visual: arrowRow(), html: true,
          o: [arrow(225, 44), arrow(90, 44), arrow(180, 44), arrow(0, 44)], labels: ["Arrow pointing down-left", "Arrow pointing right", "Arrow pointing down", "Arrow pointing up"], a: 2 },
        { cat: "Verbal", q: "Which letter comes next? A, C, F, J, O, …", o: ["S", "T", "U", "V"], a: 2 },
        { cat: "Numerical", q: "A shirt costs 40 after a 20% discount. What was the original price?", o: ["48", "50", "52", "60"], a: 1 },
        { cat: "Logical", q: "Some cats are black. All black things absorb heat. Which statement must be true?", o: ["All cats absorb heat", "No cats absorb heat", "Some cats absorb heat", "Only black cats are cats"], a: 2 },
        { cat: "Verbal", q: "Which word does not belong?", o: ["Guitar", "Violin", "Cello", "Flute"], a: 3 },
        { cat: "Spatial", q: "Which picture completes the grid?", visual: matrix(), html: true,
          o: [cell("s", 3, 48), cell("t", 2, 48), cell("t", 3, 48), cell("c", 3, 48)], labels: ["Three squares", "Two triangles", "Three triangles", "Three circles"], a: 2 },
        { cat: "Numerical", q: "A train travels 120 km in 1.5 hours. What is its average speed?", o: ["60 km/h", "75 km/h", "80 km/h", "90 km/h"], a: 2 },
        { cat: "Logical", q: "Mia is taller than Ana. Ana is taller than Zoe. Zoe is taller than Liv. Who is the second shortest?", o: ["Ana", "Zoe", "Liv", "Mia"], a: 1 },
        { cat: "Verbal", q: "If A = 1, B = 2, C = 3 and so on, CAT = 24. What is DOG?", o: ["24", "27", "26", "30"], a: 2 },
        { cat: "Logical", q: "If 5 machines make 5 widgets in 5 minutes, how long do 100 machines take to make 100 widgets?", o: ["1 minute", "5 minutes", "20 minutes", "100 minutes"], a: 1 },
        { cat: "Numerical", q: "What number comes next? 2, 3, 5, 7, 11, 13, …", o: ["15", "16", "17", "19"], a: 2 },
        { cat: "Spatial", q: "What is the smaller angle between the hour and minute hands of a clock at 3:30?", o: ["60°", "75°", "90°", "105°"], a: 1 },
        { cat: "Spatial", q: "A large cube is painted on the outside, then cut into 27 equal smaller cubes. How many small cubes have paint on exactly two faces?", o: ["6", "8", "12", "16"], a: 2 }
      ],
      bands: [[79, 3, "Below average range"], [89, 2, "Low average range"], [109, 1, "Average range"], [119, 0, "High average range"], [129, 0, "Superior range"], [160, 0, "Very superior range"]],
      related: ["adhd-test", "mental-health-check"],
      source: "Puzzles written for this site. The score is an estimate for fun and self-reflection. It is not a standardised IQ assessment, which must be given in person by a qualified psychologist."
    },

    /* ===== Habits and body ===== */
    {
      slug: "addiction-test", group: "habits", kind: "check", minutes: 3,
      title: "Addiction Test",
      short: "Looks at your relationship with alcohol or drugs over the past year.",
      tags: "addiction alcohol drugs substance use drinking cannabis",
      stem: "Over the past 12 months, how often has this been true for you?",
      scale: "f5",
      items: [
        { q: "Which substance are you thinking about for this check?", stem: "Before we begin", o: opts(["Alcohol", "Cannabis", "Prescription medicines", "Other drugs", "More than one of these"]), score: false },
        "I use it more often, or in larger amounts, than I meant to.",
        "I’ve wanted to cut down or stop, but found it hard.",
        "I spend a lot of time getting it, using it, or recovering from it.",
        "I have strong cravings or urges to use.",
        "My use has caused problems at work, school or home.",
        "I keep using even though it causes problems with people close to me.",
        "I’ve given up activities I used to enjoy because of my use.",
        "I use in situations where it could be physically dangerous, such as driving.",
        "I need more than before to get the same effect.",
        "I feel unwell (shaky, sweaty, anxious or sick) when I cut down or stop."
      ],
      bands: [[4, 0, "Low risk", "Your answers suggest your use is not causing significant problems right now."],
              [14, 1, "Some signs of problem use", "Your answers suggest your use may be starting to affect your life. It’s a good time to think about cutting back."],
              [24, 2, "Moderate signs of addiction", "Your answers suggest your use is causing real problems. A doctor or addiction service can help you make a plan."],
              [40, 3, "Strong signs of addiction", "Your answers suggest your use has a strong hold on your life. Please reach out to a doctor or addiction service. Recovery is possible, and support makes it easier."]],
      flags: [{ i: 10, min: 2, type: "medical", text: "You said you feel unwell when you cut down or stop. Stopping alcohol or some medicines suddenly can be dangerous. Please speak with a doctor before stopping, so it can be done safely." }],
      related: ["gambling-addiction-test", "depression-test"],
      source: "Written for this site based on the substance use disorder criteria in DSM-5. This is not a validated instrument."
    },
    {
      slug: "gambling-addiction-test", group: "habits", kind: "check", minutes: 2,
      title: "Gambling Addiction Test",
      short: "Checks whether betting, gaming for money or trading is becoming a problem.",
      tags: "gambling betting casino lottery sports betting addiction",
      intro: "Includes casinos, lotteries, sports betting, online games with money, and high-risk trading.",
      stem: "Over the past 12 months, how often has this been true for you?",
      scale: "f5",
      items: [
        "I bet more than I can really afford to lose.",
        "I need to bet larger amounts to feel the same excitement.",
        "I go back another day to try to win back money I’ve lost.",
        "I’ve borrowed money or sold things to gamble.",
        "I’ve felt that I might have a problem with gambling.",
        "Gambling has caused me stress, anxiety or low mood.",
        "People have criticised my betting or told me I have a problem.",
        "Gambling has caused money problems for me or my household.",
        "I feel guilty about the way I gamble, or about what happens when I do.",
        "I hide or lie about how much I gamble."
      ],
      bands: [[3, 0, "Low risk", "Your answers suggest gambling isn’t causing you problems right now."],
              [10, 1, "Some risk", "Your answers suggest gambling may be starting to cause problems. Setting firm time and money limits can help."],
              [20, 2, "Moderate risk", "Your answers suggest gambling is causing problems in your life. Consider talking to a gambling support service or counsellor."],
              [40, 3, "Problem gambling", "Your answers suggest gambling has become a serious problem. Please reach out for support. Many countries have free, confidential gambling helplines."]],
      next: ["Most banks and betting apps let you block gambling transactions or set self-exclusion. Turning these on can help."],
      related: ["addiction-test", "depression-test"],
      source: "Written for this site based on common features of gambling disorder. This is not a validated instrument."
    },
    {
      slug: "eating-disorder-test", group: "habits", kind: "check", minutes: 2,
      title: "Eating Disorder Test",
      short: "Looks at your relationship with food, eating and body image.",
      tags: "eating disorder anorexia bulimia binge food body image",
      stem: "Over the past 3 months, how often has this been true for you?",
      scale: "f5",
      items: [
        "I spend a lot of time thinking about food, weight or body shape.",
        "My weight or shape strongly affects how I feel about myself.",
        "I feel I’ve lost control over how much I eat.",
        "I eat what feels like a very large amount in a short time, and feel distressed afterwards.",
        "I hold back from eating, even when I’m hungry, to control my weight or shape.",
        "I try to make up for eating by vomiting, using laxatives, or exercising excessively.",
        "I feel anxious or guilty after eating.",
        "Worries about food or my body get in the way of my social life, work or studies."
      ],
      bands: [[8, 0, "Few signs of an eating disorder", "Your answers suggest food and body image aren’t causing you significant distress."],
              [16, 2, "Some signs of an eating disorder", "Your answers suggest your relationship with food or your body may be causing you distress. Talking to a doctor or eating disorder service early can really help."],
              [32, 3, "Strong signs of an eating disorder", "Your answers suggest you may have an eating disorder. Please reach out to a doctor or eating disorder specialist. Recovery is possible."]],
      flags: [{ i: 5, min: 1, type: "medical", text: "Vomiting, laxative use and over-exercising can affect your heart and body chemistry, even if you feel fine. Please see a doctor for a check-up." }],
      related: ["depression-test", "anxiety-test"],
      source: "Written for this site based on common features of eating disorders. This is not a validated instrument."
    },

    /* ===== Young people ===== */
    {
      slug: "youth-mental-health-test", group: "young", kind: "check", minutes: 3,
      title: "Youth Mental Health Test",
      short: "For ages 11 to 17. A check-in on mood, worry, sleep, school and friendships.",
      tags: "youth teen teenager student young people school",
      intro: "This check is for people aged 11 to 17. Your answers stay on this device and are never sent anywhere.",
      stem: "Over the past 2 weeks, how often…",
      scale: "youth",
      items: [
        "did you feel sad, empty or down?",
        "did you stop enjoying things you usually like?",
        "did you feel worried, nervous or scared?",
        "was it hard to calm down or relax?",
        "did you have trouble sleeping, or sleep much more than usual?",
        "did you feel really tired or have no energy?",
        "was it hard to concentrate at school or on homework?",
        "did you feel lonely or left out?",
        "were you bullied, teased or treated badly, online or in person?",
        "did you feel angry or grumpy a lot of the time?",
        "did you feel bad about yourself or your body?",
        "did you feel you had no one to talk to about your problems?",
        "did you think about hurting yourself, or that you’d be better off not being here?"
      ],
      bands: [[8, 0, "You seem to be doing okay", "Your answers suggest things are going fairly well. It’s still good to talk about how you feel with people you trust."],
              [17, 1, "Things have been a bit hard", "Your answers suggest some things have been tough lately. Talking to a parent, teacher, school counsellor or another adult you trust can help."],
              [26, 2, "Things have been really hard", "Your answers suggest you’ve been going through a lot. Please talk to a trusted adult soon, and ask them to help you see a doctor or counsellor."],
              [39, 3, "You need some support right now", "Your answers suggest you are struggling a lot. You deserve help. Please tell a trusted adult today and ask them to help you get support."]],
      subs: [
        { name: "Mood", items: [0, 1, 5, 10] },
        { name: "Worry", items: [2, 3] },
        { name: "Sleep and focus", items: [4, 6] },
        { name: "Friends and support", items: [7, 8, 11] }
      ],
      flags: [{ i: 12, min: 1, type: "crisis", text: "You said you’ve had thoughts of hurting yourself or not being here. That sounds really hard, and you don’t have to deal with it alone. Please tell a parent, teacher or another adult you trust today, or contact a helpline below. Many have text or chat options for young people." }],
      youth: true,
      related: ["parent-test"],
      source: "Written for this site as a general wellbeing check-in for young people. This is not a validated instrument."
    },
    {
      slug: "parent-test", group: "young", kind: "check", minutes: 3,
      title: "Parent Test: Your Child’s Mental Health",
      short: "The Pediatric Symptom Checklist-17, for parents of children aged 4 to 16.",
      tags: "parent child kids children behaviour psc-17 pediatric",
      intro: "Answer about your child, aged 4 to 16. Pick the answer that best describes them recently.",
      stem: "How often does this describe your child?",
      scale: "psc",
      items: [
        "Fidgety, unable to sit still",
        "Feels sad, unhappy",
        "Daydreams too much",
        "Refuses to share",
        "Does not understand other people’s feelings",
        "Feels hopeless",
        "Has trouble concentrating",
        "Fights with other children",
        "Is down on him or herself",
        "Blames others for his or her troubles",
        "Seems to be having less fun",
        "Does not listen to rules",
        "Acts as if driven by a motor",
        "Teases others",
        "Worries a lot",
        "Takes things that do not belong to him or her",
        "Distracted easily"
      ],
      bands: [[14, 0, "Below the level of concern", "Your answers are below the overall level that usually needs follow-up. Check the areas below in case one stands out."],
              [34, 2, "Above the level of concern", "Your answers are above the level where a follow-up is recommended. Please share this result with your child’s doctor or a child mental health professional."]],
      subs: [
        { name: "Attention", items: [0, 2, 6, 12, 16], cut: 7, note: "Scores of 7 or more suggest attention difficulties worth discussing with a professional." },
        { name: "Internalising (mood and worry)", items: [1, 5, 8, 10, 14], cut: 5, note: "Scores of 5 or more suggest anxiety or low mood worth discussing with a professional." },
        { name: "Externalising (behaviour)", items: [3, 4, 7, 9, 11, 13, 15], cut: 7, note: "Scores of 7 or more suggest behaviour difficulties worth discussing with a professional." }
      ],
      custom: function (res) {
        if (res.score <= 14 && res.subs.some(function (s) { return s.hit; })) {
          res.band = { tone: 1, label: "One area may need attention", text: "The overall score is below the level of concern, but at least one area is above its own threshold. Consider discussing it with your child’s doctor." };
        }
        return res;
      },
      next: ["If your child is old enough, the Youth Mental Health Test lets them share how they see things."],
      related: ["youth-mental-health-test", "adhd-test"],
      source: "Pediatric Symptom Checklist-17 (PSC-17). Gardner, W., Murphy, J.M., Jellinek, M.S., et al. Massachusetts General Hospital. Free to use."
    },

    /* ===== Surveys ===== */
    {
      slug: "psychedelics-survey", group: "survey", kind: "survey", minutes: 3,
      title: "Psychedelics & Mental Health Survey",
      short: "Reflect on psychedelic use and how it has affected your mental health.",
      tags: "psychedelics psilocybin lsd mdma ketamine ayahuasca survey",
      intro: "This survey is for reflection and harm reduction. It does not encourage drug use. Laws on psychedelics differ between countries.",
      items: [
        { q: "Have you ever used a psychedelic, such as psilocybin, LSD, ayahuasca, MDMA or ketamine?", o: opts(["Yes, in the past year", "Yes, more than a year ago", "No, but I’m curious", "No"]) },
        { q: "What was your main reason?", o: opts(["Curiosity or fun", "Personal growth", "Relief from mental health symptoms", "Spiritual reasons", "As part of a clinical trial or therapy", "Doesn’t apply to me"]) },
        { q: "Where did it usually happen?", o: opts(["In a clinical setting", "With a guide or facilitator", "With friends", "Alone", "Doesn’t apply to me"]) },
        { q: "Overall, how did it affect your mental health?", o: opts(["Much better", "A little better", "No real change", "A little worse", "Much worse", "Doesn’t apply to me"]) },
        { q: "Have you had a frightening or very difficult experience while using one?", o: opts(["No", "Yes, but I feel settled about it now", "Yes, and it still affects me", "Doesn’t apply to me"]) },
        { q: "Since using, have you noticed lasting changes in how you see things, such as visual disturbances?", o: opts(["No", "Yes", "Not sure", "Doesn’t apply to me"]) },
        { q: "Do you or a close family member have a history of psychosis, schizophrenia or bipolar disorder?", o: opts(["Yes", "No", "Not sure"]) },
        { q: "Are you currently taking any medication for your mental health?", o: opts(["Yes", "No", "Prefer not to say"]) },
        { q: "Would you consider psychedelic-assisted therapy if it were legal and available where you live?", o: opts(["Definitely", "Maybe", "Probably not", "Definitely not"]) }
      ],
      insights: function (a) {
        var out = [];
        if (a[6] === 0 || a[6] === 2) out.push({ tone: 3, title: "Your family history matters", text: "A personal or family history of psychosis or bipolar disorder can raise the risk of serious reactions to psychedelics. Please discuss this with a doctor." });
        if (a[4] === 2) out.push({ tone: 2, title: "A difficult experience that still affects you", text: "It can help to talk this through with a therapist, ideally one familiar with psychedelic experiences. Integration support is increasingly available." });
        if (a[5] === 1 || a[5] === 2) out.push({ tone: 2, title: "Lasting visual changes", text: "Ongoing changes in perception are worth mentioning to a doctor, especially if they cause distress." });
        if (a[7] === 0 && (a[0] === 0 || a[0] === 2)) out.push({ tone: 2, title: "Medication interactions", text: "Some psychedelics interact dangerously with common medicines, including some antidepressants and mood stabilisers. Always check with a doctor or pharmacist." });
        if (a[3] === 3 || a[3] === 4) out.push({ tone: 2, title: "Your mental health felt worse", text: "If you’re still feeling the effects, a doctor or therapist can help. You might also take the Depression Test or Anxiety Test." });
        if (a[1] === 2) out.push({ tone: 1, title: "Looking for relief", text: "If you’re looking for relief from symptoms, evidence-based treatments such as therapy and medication are available. Research into psychedelic therapy is ongoing, mostly in supervised clinical settings." });
        if (a[0] === 2) out.push({ tone: 1, title: "Curious about psychedelics", text: "If you’re curious, look for trustworthy harm-reduction information and learn about the legal situation where you live." });
        if (!out.length) out.push({ tone: 0, title: "Nothing stood out", text: "Nothing in your answers suggests a particular risk. Keep looking after your mental health, and come back if anything changes." });
        return out;
      },
      related: ["depression-test", "psychosis-test", "addiction-test"],
      source: "Survey written for this site. Answers stay on your device unless the site owner has turned on anonymous sharing and you agree to it."
    },
    {
      slug: "ai-mental-health-survey", group: "survey", kind: "survey", minutes: 2,
      title: "AI & Mental Health Survey",
      short: "How do chatbots and AI tools fit into the way you look after your mind?",
      tags: "ai artificial intelligence chatbot technology survey",
      items: [
        { q: "How often do you use AI chatbots or assistants?", o: opts(["Every day", "Every week", "Every month", "Rarely", "Never"]) },
        { q: "Have you ever talked to an AI about your feelings or mental health?", o: opts(["Often", "Sometimes", "Once or twice", "Never"]) },
        { q: "What do you mostly use it for when it comes to your wellbeing?", o: opts(["Venting or getting things off my chest", "Advice on a problem", "Learning about mental health", "Coping techniques", "Company when I feel lonely", "I don’t use it for this"]) },
        { q: "How helpful has it been?", o: opts(["Very helpful", "Somewhat helpful", "Not very helpful", "Unhelpful or harmful", "I don’t use it for this"]) },
        { q: "Do you ever talk to an AI instead of talking to people in your life?", o: opts(["Often", "Sometimes", "Rarely", "Never"]) },
        { q: "Have you ever felt worse after a conversation with an AI?", o: opts(["Yes", "No", "Not sure"]) },
        { q: "How much do you trust mental health information from AI?", o: opts(["A lot", "Somewhat", "A little", "Not at all"]) },
        { q: "How concerned are you about the privacy of what you share with AI?", o: opts(["Very concerned", "Somewhat concerned", "Not very concerned", "Not concerned at all"]) },
        { q: "Would you tell a doctor or therapist that you use AI for emotional support?", o: opts(["Yes", "Maybe", "No", "I don’t use it for this"]) }
      ],
      insights: function (a) {
        var out = [];
        if (a[4] === 0 || a[4] === 1) out.push({ tone: 2, title: "AI instead of people", text: "AI can be a useful place to think things through, but it can’t replace the people who know and care about you. Try reaching out to one person this week, even with a short message." });
        if (a[5] === 0) out.push({ tone: 2, title: "Feeling worse afterwards", text: "If a conversation left you feeling worse, it’s okay to step away. For ongoing difficulties, a trained professional can offer support that adapts to you." });
        if (a[3] === 3) out.push({ tone: 2, title: "It wasn’t helpful", text: "Not every tool suits every person. A doctor, counsellor or support line may be a better fit for what you need." });
        if (a[6] === 0) out.push({ tone: 1, title: "High trust in AI information", text: "AI can make mistakes. Check important health information with a professional or a trusted health organisation." });
        if (a[7] >= 2 && a[1] <= 1) out.push({ tone: 1, title: "Think about privacy", text: "Check the privacy settings of the tools you use, and avoid sharing details that could identify you." });
        if (a[1] <= 1 && a[8] === 2) out.push({ tone: 1, title: "Tell your care team", text: "If you see a doctor or therapist, telling them how you use AI can help them support you better." });
        if (a[3] <= 1) out.push({ tone: 0, title: "It’s been useful", text: "It sounds like AI has helped you. It works best alongside human connection and professional care when you need it." });
        if (!out.length) out.push({ tone: 0, title: "A balanced relationship", text: "Your answers suggest a balanced relationship with AI tools. Keep human connection at the centre of your wellbeing." });
        return out;
      },
      related: ["mental-health-check", "anxiety-test"],
      source: "Survey written for this site. Answers stay on your device unless the site owner has turned on anonymous sharing and you agree to it."
    },
    {
      slug: "self-injury-survey", group: "survey", kind: "survey", minutes: 3,
      title: "Self-Injury Survey",
      short: "A private space to reflect on self-injury and find support that fits you.",
      tags: "self-injury self harm cutting nssi survey",
      intro: "If you are in danger right now, please contact a crisis line or emergency services before continuing. You can skip this survey at any time.",
      showHelpFirst: true,
      items: [
        { q: "Have you ever hurt yourself on purpose?", o: [["Yes, in the past month", 0], ["Yes, in the past year", 1], ["Yes, more than a year ago", 2], ["No, but I’ve had urges to", 3], ["No, never", 4, "end"]] },
        { q: "How often do you have urges to hurt yourself now?", o: opts(["Never", "Rarely", "Sometimes", "Often", "Very often"]) },
        { q: "When the urges come, what is usually going on?", o: opts(["Overwhelming emotions", "Feeling numb or empty", "Stress or pressure", "Conflict with others", "Being very hard on myself", "I’m not sure"]) },
        { q: "Does anyone in your life know?", o: opts(["Yes, and they’re supportive", "Yes, but they aren’t supportive", "No one knows", "Prefer not to say"]) },
        { q: "Have you talked to a professional about it?", o: opts(["Yes, I’m getting support now", "Yes, in the past", "No, but I would like to", "No"]) },
        { q: "Have you ever had an injury that needed medical care?", o: opts(["Yes", "No", "Prefer not to say"]) },
        { q: "Do you also have thoughts of ending your life?", o: opts(["No", "Sometimes", "Often", "Yes, right now"]) },
        { q: "What helps you most when urges come?", o: opts(["Talking to someone", "Distracting myself", "Something creative", "Going for a walk or moving my body", "Nothing has helped yet"]) }
      ],
      flags: [{ i: 6, min: 3, type: "crisis", text: "You said you are having thoughts of ending your life right now. Please contact a crisis line or your local emergency number now. If you can, stay with someone or go to a place where other people are around." }],
      insights: function (a) {
        var out = [];
        if (a[0] === 4) {
          out.push({ tone: 0, title: "Thanks for checking in", text: "You told us you haven’t hurt yourself. If you’re here because you’re worried about someone else, listening without judgement and helping them find support is one of the most useful things you can do." });
          return out;
        }
        if (a[6] === 1 || a[6] === 2) out.push({ tone: 3, title: "Thoughts of ending your life", text: "Please tell a doctor, counsellor or someone you trust about these thoughts. A crisis line is there any time you need to talk, day or night." });
        if (a[5] === 0) out.push({ tone: 2, title: "Looking after your body", text: "If an injury ever looks infected or won’t heal, please get medical care. Health workers are there to help, not to judge." });
        if (a[3] === 2) out.push({ tone: 2, title: "You’ve been carrying this alone", text: "It can feel scary to tell someone. You could start with one trusted person, or a helpline where you can stay anonymous." });
        if (a[3] === 1) out.push({ tone: 2, title: "When people don’t understand", text: "Not everyone reacts well at first. A counsellor, doctor or helpline can offer the understanding you deserve." });
        if (a[4] === 2) out.push({ tone: 1, title: "You’d like professional support", text: "That’s a strong step. A doctor can refer you, or you can contact a counselling service directly. Therapies like DBT are designed to help with urges and difficult emotions." });
        if (a[1] >= 3) out.push({ tone: 2, title: "Frequent urges", text: "When urges come often, a written safety plan can help: warning signs, things that calm you, people to contact, and professional numbers. A counsellor can help you make one." });
        if (a[7] === 4) out.push({ tone: 1, title: "Finding what helps", text: "It can take time to find coping strategies that work for you. A therapist can help you build a set of options for different situations." });
        else if (a[7] != null) out.push({ tone: 0, title: "You know something that helps", text: "Keep that strategy close. Write it down with a few others so it’s ready when urges come." });
        out.push({ tone: 0, title: "You are not alone", text: "Many people experience self-injury, and many find ways to feel better. You deserve support and care." });
        return out;
      },
      related: ["depression-test", "anxiety-test", "youth-mental-health-test"],
      source: "Survey written for this site. Answers stay on your device unless the site owner has turned on anonymous sharing and you agree to it."
    },

    /* ===== General wellbeing ===== */
    {
      slug: "stress-test", group: "wellbeing", kind: "check", minutes: 3,
      title: "Stress Test",
      short: "Measures how much pressure you are under and how your body and mood are handling it.",
      tags: "stress pressure overwhelmed tension coping",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "I feel tense, wound up or on edge.",
        "I have more to do than I can handle.",
        "I find it hard to switch off and relax.",
        "I get headaches, stomach problems or muscle tension.",
        "I feel irritable or snap at people.",
        "Things on my mind keep me awake.",
        "I feel that events are out of my control.",
        "I have no time for the things I enjoy.",
        "I feel tired even after resting.",
        "Small problems feel overwhelming."
      ],
      bands: [[10, 0, "Low stress", "Your answers suggest your stress is at a manageable level right now."],
              [20, 1, "Moderate stress", "You are carrying a fair amount of pressure. Protecting your sleep, breaks and time off matters more than usual right now."],
              [30, 2, "High stress", "Your answers suggest high stress that is affecting your body and mood. Something in your workload or commitments probably needs to change, and a doctor or counsellor can help you plan that."],
              [40, 3, "Very high stress", "Your answers suggest very high stress. Long periods at this level affect physical health as well as mental health. Please talk to a doctor or counsellor soon."]],
      next: ["Pick one thing this week that you can cancel, postpone or hand to someone else.", "Long stretches of stress often show up as low mood or anxiety. The Depression Test and Anxiety Test can tell you more."],
      related: ["burnout-test", "sleep-test", "anxiety-test"],
      source: "Written for this site based on common signs of stress. This is not a validated instrument."
    },
    {
      slug: "burnout-test", group: "wellbeing", kind: "check", minutes: 3,
      title: "Burnout Test",
      short: "Checks for exhaustion, cynicism and lost effectiveness at work or study.",
      tags: "burnout work job exhaustion career study overwork",
      intro: "Answer about your work, studies or your main caring responsibility.",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "I feel emotionally drained by my work.",
        "I feel used up at the end of the day.",
        "I dread starting another day of work.",
        "Even after a day off, I do not feel recovered.",
        "I have become less interested in my work.",
        "I wonder whether my work matters at all.",
        "I keep people at a distance at work.",
        "I do the minimum and little more.",
        "I struggle to concentrate on my tasks.",
        "I get much less done than I used to.",
        "I doubt that I am good at my job.",
        "I no longer feel a sense of achievement."
      ],
      subs: [
        { name: "Exhaustion", items: [0, 1, 2, 3], cut: 11 },
        { name: "Cynicism and distance", items: [4, 5, 6, 7], cut: 11 },
        { name: "Effectiveness", items: [8, 9, 10, 11], cut: 11 }
      ],
      bands: [[12, 0, "Little sign of burnout", "Your answers suggest work is not burning you out at the moment."],
              [24, 1, "Early signs of burnout", "You are showing early signs. This is the easiest stage to turn around, usually by protecting recovery time and reducing what you take on."],
              [36, 2, "Moderate burnout", "Your answers suggest burnout that is affecting how you feel and how you work. Talk to your manager, tutor or doctor about workload and recovery before it deepens."],
              [48, 3, "Severe burnout", "Your answers suggest severe burnout. Please speak with a doctor. Burnout at this level rarely improves without real changes to workload and proper rest."]],
      next: ["Burnout comes from the situation, not from weakness. Ask what could change about your workload, control or support.", "Burnout and depression overlap. If low mood follows you outside work too, take the Depression Test."],
      related: ["stress-test", "depression-test", "sleep-test"],
      source: "Written for this site based on the three dimensions of burnout described by Maslach and colleagues: exhaustion, cynicism and reduced effectiveness. This is not a validated instrument."
    },
    {
      slug: "sleep-test", group: "wellbeing", kind: "check", minutes: 2,
      title: "Sleep Quality Test",
      short: "Looks at how well you sleep and how it affects your days.",
      tags: "sleep insomnia tired rest night awake",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "It takes me more than 30 minutes to fall asleep.",
        "I wake during the night and struggle to get back to sleep.",
        "I wake much earlier than I want to.",
        "I feel sleepy during the day.",
        "I use screens in bed until late.",
        "Worry or racing thoughts keep me from sleeping.",
        "I rely on caffeine to get through the day.",
        "My sleep and wake times change a lot from day to day.",
        "I feel unrefreshed when I wake up.",
        "Poor sleep affects my mood, work or studies."
      ],
      bands: [[8, 0, "Healthy sleep", "Your answers suggest your sleep is working well for you."],
              [18, 1, "Mild sleep difficulty", "You have some sleep difficulty. Regular wake times, daylight in the morning and a screen-free wind-down usually help."],
              [28, 2, "Poor sleep", "Your answers suggest poor sleep that is affecting your days. Talk to a doctor, and ask about CBT for insomnia, which works better than sleeping pills for most people."],
              [40, 3, "Very poor sleep", "Your answers suggest very poor sleep. Please see a doctor. Ongoing insomnia is treatable, and daytime sleepiness can point to conditions such as sleep apnoea that need checking."]],
      next: ["Keep the same wake-up time every day, including weekends. It steadies your body clock faster than changing bedtimes.", "If you cannot sleep after about 20 minutes, get up, do something calm in dim light, and go back when sleepy."],
      related: ["stress-test", "anxiety-test", "depression-test"],
      source: "Written for this site based on common features of insomnia and poor sleep quality. This is not a validated instrument."
    },

    /* ===== Habits ===== */
    {
      slug: "phone-addiction-test", group: "habits", kind: "check", minutes: 2,
      title: "Phone & Social Media Addiction Test",
      short: "Checks whether your phone is taking more from you than it gives.",
      tags: "phone smartphone social media instagram screen time scrolling doomscrolling internet",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "I check my phone within minutes of waking up.",
        "I spend far longer on my phone than I meant to.",
        "I feel restless or anxious when my phone is not nearby.",
        "I lose sleep because of my phone.",
        "Scrolling gets in the way of work, study or chores.",
        "People close to me complain about my phone use.",
        "I use my phone to escape from difficult feelings.",
        "I feel worse about myself after using social media.",
        "I have tried to cut down and could not.",
        "I check for notifications when there are none."
      ],
      bands: [[10, 0, "Healthy use", "Your answers suggest your phone use is not causing you problems."],
              [20, 1, "Some signs of dependence", "Your phone is taking up more space than you would like. Small limits, such as charging it outside the bedroom, usually help."],
              [30, 2, "Problematic use", "Your answers suggest your phone use is affecting your sleep, focus or mood. Try app timers, greyscale, and one screen-free hour a day, and notice what the scrolling is helping you avoid."],
              [40, 3, "Strong dependence", "Your answers suggest a strong dependence on your phone. If cutting down alone has not worked, a counsellor can help you look at what the habit is doing for you."]],
      next: ["Heavy use often sits on top of anxiety, low mood or loneliness. The Anxiety Test and Loneliness Test may explain more."],
      related: ["loneliness-test", "anxiety-test", "sleep-test"],
      source: "Written for this site based on common features of behavioural addiction. This is not a validated instrument."
    },

    /* ===== Self and relationships ===== */
    {
      slug: "self-esteem-test", group: "self", kind: "check", minutes: 2,
      title: "Self-Esteem Test",
      short: "Looks at how you see and talk to yourself.",
      tags: "self esteem confidence self worth self critical inner critic",
      stem: "How often has this been true for you lately?",
      scale: "f5",
      items: [
        "I am very critical of myself.",
        "I feel I am not as good as other people.",
        "I find it hard to accept a compliment.",
        "I worry that people think badly of me.",
        "I feel I do not deserve good things.",
        "I compare myself with others and come off worse.",
        "I avoid trying things in case I fail.",
        "I feel guilty when I put my own needs first.",
        "I focus on my flaws rather than my strengths.",
        "One mistake makes me feel like a failure."
      ],
      bands: [[10, 0, "Healthy self-esteem", "Your answers suggest you are reasonably kind to yourself. Most people have hard days, and that is normal."],
              [20, 1, "Some self-doubt", "You are harder on yourself than you need to be. Noticing your inner critic, and asking whether you would speak that way to a friend, is a good place to start."],
              [30, 2, "Low self-esteem", "Your answers suggest low self-esteem that is shaping your choices. Therapy, especially CBT, is effective for this, and self-esteem can genuinely be rebuilt."],
              [40, 3, "Very low self-esteem", "Your answers suggest very low self-esteem. This often travels with depression or anxiety, so it is worth speaking to a doctor or counsellor."]],
      next: ["Write down three things you did well each day for a week. It sounds small, and it works because it forces attention onto evidence you usually skip."],
      related: ["depression-test", "social-anxiety-test", "loneliness-test"],
      source: "Written for this site based on common features of low self-esteem. This is not a validated instrument."
    },
    {
      slug: "loneliness-test", group: "self", kind: "check", minutes: 2,
      title: "Loneliness Test",
      short: "Measures how connected you feel to the people around you.",
      tags: "loneliness alone isolated connection friends social",
      stem: "How often has this been true for you lately?",
      scale: "f5",
      items: [
        "I feel alone even when other people are around.",
        "I have no one I can talk to about personal things.",
        "I feel left out of what is going on around me.",
        "I wish I had people in my life who really understand me.",
        "I find it hard to reach out to others.",
        "I feel disconnected from friends or family.",
        "I spend more time alone than I want to.",
        "Feeling lonely affects my mood or sleep."
      ],
      bands: [[8, 0, "Low loneliness", "Your answers suggest you feel reasonably connected to the people around you."],
              [16, 1, "Some loneliness", "You feel lonely at times. One regular point of contact each week, rather than a big social push, is usually what shifts this."],
              [24, 2, "High loneliness", "Your answers suggest persistent loneliness. It is common, it is not a personal failing, and it responds to shared activity more than to advice."],
              [32, 3, "Very high loneliness", "Your answers suggest you feel deeply disconnected. Long-term loneliness affects both mental and physical health, so please talk to a doctor or counsellor about it."]],
      next: ["Shared activity beats small talk. A class, a team, a place of worship or volunteering puts you beside people regularly with something to do.", "Message one person you have lost touch with. A short message is enough."],
      related: ["social-anxiety-test", "depression-test", "phone-addiction-test"],
      source: "Written for this site based on common features of loneliness. This is not a validated instrument."
    },
    {
      slug: "anger-test", group: "self", kind: "check", minutes: 2,
      title: "Anger Test",
      short: "Checks how often anger takes over and what it costs you.",
      tags: "anger temper rage irritable aggression short fuse",
      stem: "Over the past month, how often has this been true for you?",
      scale: "f5",
      items: [
        "I lose my temper more quickly than I would like.",
        "Small things set me off.",
        "I raise my voice or shout when I am angry.",
        "I say things in anger that I regret later.",
        "I hold on to anger long after the event.",
        "My anger affects my relationships at home or work.",
        "My body tenses up when I am annoyed: jaw, fists, racing heart.",
        "I have thrown or broken things when angry.",
        "People have told me I need to control my temper.",
        "I feel guilty or ashamed after I get angry."
      ],
      bands: [[10, 0, "Anger in the normal range", "Anger is a normal emotion, and your answers suggest it is not causing you problems."],
              [20, 1, "Some difficulty with anger", "Anger gets the better of you at times. Spotting the early physical signs, and stepping away for 20 minutes, prevents most escalations."],
              [30, 2, "Anger is causing problems", "Your answers suggest anger is damaging your relationships or peace of mind. Anger management programmes and CBT work well, and many are free."],
              [40, 3, "Anger needs attention now", "Your answers suggest anger is frequent and costly. Please speak with a doctor or counsellor about it soon."]],
      flags: [{ i: 7, min: 2, type: "medical", text: "You said you have thrown or broken things when angry. If anger has ever led to hurting someone, or people around you are afraid, please seek help now rather than waiting. Talking to a professional is a step towards keeping everyone safe, including you." }],
      next: ["Anger often sits on top of something else: exhaustion, pain, stress or low mood. Treating that usually lowers the temperature."],
      related: ["stress-test", "depression-test", "relationship-test"],
      source: "Written for this site based on common features of problem anger. This is not a validated instrument."
    },
    {
      slug: "relationship-test", group: "self", kind: "check", minutes: 3,
      title: "Relationship Health Test",
      short: "A look at how your relationship is doing, and where the strain sits.",
      tags: "relationship marriage partner couple love breakup arguments",
      intro: "Answer about your current relationship. If you are not in one, you might prefer the Loneliness Test.",
      stem: "How often has this been true in your relationship recently?",
      scale: "f5",
      items: [
        "We argue about the same things without ever resolving them.",
        "I feel unheard when I share how I feel.",
        "We spend very little quality time together.",
        "I feel criticised or put down.",
        "I hide things to avoid conflict.",
        "We struggle to talk about money, family or the future.",
        "Affection or intimacy between us has faded.",
        "I feel lonely in this relationship.",
        "Trust is a problem for one or both of us.",
        "I walk on eggshells around my partner.",
        "I feel controlled about money, friends or where I go.",
        "I do not feel respected."
      ],
      scaleEnds: ["Healthy", "Strained"],
      bands: [[12, 0, "A healthy relationship", "Your answers suggest your relationship is in reasonable shape. Every couple has friction, and that is normal."],
              [24, 1, "Some strain", "There is real strain in a few areas. Relationships usually improve fastest when both people name one pattern and work on it together."],
              [36, 2, "Significant strain", "Your answers suggest significant strain across several areas. Couples counselling helps many people, and it is more useful early than as a last resort."],
              [48, 3, "Serious difficulty", "Your answers suggest your relationship is causing you real distress. Talking to a counsellor on your own, not only as a couple, can help you think clearly about what you need."]],
      flags: [{ i: 10, min: 2, type: "medical", text: "You said you feel controlled about money, friends or where you go. Along with walking on eggshells, that can be a sign of an abusive relationship, which is not about arguing or falling out of love. Confidential support exists in most countries, and findahelpline.com lists domestic abuse lines as well as crisis lines." }],
      next: ["Try describing the pattern rather than the person: “we keep having the same argument about money” lands differently from “you always overspend”."],
      related: ["loneliness-test", "anger-test", "self-esteem-test"],
      source: "Written for this site based on common signs of relationship distress. This is not a validated instrument, and it cannot assess a relationship for you."
    },

    /* ===== Personality ===== */
    {
      slug: "personality-test", group: "personality", kind: "profile", minutes: 4,
      title: "Big Five Personality Test",
      short: "Your profile across the five traits psychologists use to describe personality.",
      tags: "personality big five ocean traits openness extraversion character",
      intro: "There are no good or bad results here. Answer with how you generally are, not how you would like to be.",
      stem: "How much do you agree?",
      scale: "agree",
      items: [
        "I start conversations easily.",
        "I enjoy being the centre of attention.",
        { q: "I keep to myself at social gatherings.", rev: true },
        { q: "I find small talk draining.", rev: true },
        "I feel other people's emotions.",
        "I go out of my way to make people comfortable.",
        { q: "I am not very interested in other people's problems.", rev: true },
        { q: "I can be blunt, even if it stings.", rev: true },
        "I finish what I start.",
        "I like to plan ahead.",
        { q: "I leave my belongings in a mess.", rev: true },
        { q: "I put things off until the last minute.", rev: true },
        "I worry about things.",
        "My mood can change quickly.",
        { q: "I stay calm under pressure.", rev: true },
        { q: "I rarely feel down.", rev: true },
        "I enjoy new ideas and unusual points of view.",
        "I have a vivid imagination.",
        { q: "Abstract ideas do not interest me.", rev: true },
        { q: "I prefer routine to variety.", rev: true }
      ],
      subs: [
        { name: "Extraversion", items: [0, 1, 2, 3], desc: ["You draw energy from quiet and from your own company. You probably prefer depth with a few people over breadth with many.", "You move between sociable and solitary depending on the day. Company suits you in doses.", "You come alive around people. You think out loud, and a busy room lifts rather than drains you."] },
        { name: "Agreeableness", items: [4, 5, 6, 7], desc: ["You are direct and led by what is true rather than what is comfortable. You may come across as blunt.", "You balance warmth with honesty, and can push back when something matters.", "You are warm, tuned in to others and quick to help. Watch that you do not put yourself last."] },
        { name: "Conscientiousness", items: [8, 9, 10, 11], desc: ["You work in bursts and prefer flexibility to plans. Deadlines and structure from outside help you.", "You are organised when it counts and relaxed when it does not.", "You are organised, reliable and follow through. Take care that high standards do not tip into pressure."] },
        { name: "Emotional sensitivity", items: [12, 13, 14, 15], desc: ["You are even-keeled and recover quickly when things go wrong.", "You feel stress like most people do: it registers, then it passes.", "You feel things strongly and stress lingers. That comes with real empathy, and it means rest and support matter more for you than for most."] },
        { name: "Openness", items: [16, 17, 18, 19], desc: ["You are practical and grounded, and you trust what is proven over what is new.", "You enjoy new things without needing constant novelty.", "You are curious, imaginative and drawn to ideas. Routine can bore you quickly."] }
      ],
      next: ["Traits are tendencies, not limits. They describe where you start, not what you can do.", "If one trait surprised you, ask someone who knows you well whether they see it the same way."],
      noAdvice: true,
      related: ["eq-test", "introvert-extrovert-test"],
      source: "Written for this site using the five-factor model of personality (openness, conscientiousness, extraversion, agreeableness, neuroticism). The items are original and this is not a validated instrument."
    },
    {
      slug: "eq-test", group: "personality", kind: "check", minutes: 3,
      title: "Emotional Intelligence (EQ) Test",
      short: "How well you read, manage and work with emotions, yours and other people's.",
      tags: "eq emotional intelligence empathy self awareness social skills",
      stem: "How much do you agree?",
      scale: "agree",
      items: [
        "I can name what I am feeling as it happens.",
        "I know which situations set off my strongest emotions.",
        "I can calm myself down when I am upset.",
        "I think before reacting when I am angry.",
        "I notice how someone feels from their face or tone.",
        "I can see a situation from another person's point of view.",
        "People come to me when they need to talk.",
        "I can disagree with someone without damaging the relationship.",
        "I can put my feelings into words for others.",
        "I bounce back after setbacks.",
        "I take feedback without getting defensive.",
        "I adjust how I communicate depending on the person."
      ],
      scaleEnds: ["Developing", "Strong"],
      subs: [
        { name: "Knowing your own emotions", items: [0, 1, 8] },
        { name: "Managing your reactions", items: [2, 3, 9, 10] },
        { name: "Reading other people", items: [4, 5] },
        { name: "Handling relationships", items: [6, 7, 11] }
      ],
      bands: [[16, 2, "Emotional intelligence in development", "Emotional skills are learned, not fixed, and your answers suggest several are still developing. Naming what you feel, in the moment, is where almost everyone starts."],
              [28, 1, "Growing emotional intelligence", "You have a reasonable grasp of your emotions and other people's. The gaps are usually in the harder moments: conflict, criticism and stress."],
              [38, 0, "Strong emotional intelligence", "You read emotions well and handle them without being run by them. That is a real asset in work and relationships."],
              [48, 0, "Very strong emotional intelligence", "Your answers suggest well-developed emotional skills across the board. Just remember that self-ratings are generous, so ask people who know you whether they agree."]],
      next: ["Try naming feelings more precisely. “Disappointed” or “overlooked” tells you more about what to do next than “bad” does.", "In a disagreement, repeat back what the other person said before you answer. It slows the moment and lowers the heat."],
      noAdvice: true,
      related: ["personality-test", "anger-test", "relationship-test"],
      source: "Written for this site based on common models of emotional intelligence (self-awareness, self-regulation, empathy and social skill). This is not a validated instrument."
    },
    {
      slug: "introvert-extrovert-test", group: "personality", kind: "check", minutes: 2,
      title: "Introvert or Extrovert Test",
      short: "Find out where you sit on the introvert to extrovert scale.",
      tags: "introvert extrovert ambivert social energy shy outgoing",
      stem: "How much do you agree?",
      scale: "agree",
      items: [
        "Meeting new people energises me.",
        "I would rather spend a free evening out with friends than at home alone.",
        "I think out loud rather than working things through quietly first.",
        "In a group, I am usually one of the first to speak.",
        "After a busy social day I feel energised rather than drained.",
        "I enjoy being the centre of attention.",
        "I make friends quickly.",
        "I prefer working with a team to working alone.",
        "I feel restless when I spend a whole day alone.",
        "I start conversations with strangers easily."
      ],
      scaleEnds: ["Introvert", "Extrovert"],
      bands: [[13, 1, "You lean introvert", "You recharge in quiet and think before you speak. Introversion is not shyness: it is where your energy comes from. You likely prefer a few close friendships and deep conversation to big groups."],
              [26, 1, "You are an ambivert", "You sit in the middle, which is where most people are. You can enjoy a lively group and a quiet evening equally, and you adapt to what the situation needs."],
              [40, 1, "You lean extrovert", "People and activity give you energy. You think out loud and are comfortable speaking up. Your challenge is usually stillness rather than company."]],
      next: ["Plan your week around your energy: introverts need recovery time after social events, extroverts need contact built into quiet stretches.", "If groups make you anxious rather than simply drained, the Social Anxiety Test looks at that difference."],
      noAdvice: true,
      related: ["personality-test", "social-anxiety-test"],
      source: "Written for this site based on the extraversion trait in personality psychology. This is a light self-description, not a validated instrument."
    },

    /* ===== IQ and brain ===== */
    {
      slug: "logical-reasoning-test", group: "brain", kind: "iq", minutes: 10,
      title: "Logical Reasoning Test",
      short: "12 puzzles on deduction, sequences, coding and relationships.",
      tags: "logical reasoning logic aptitude deduction puzzles exam",
      intro: "You have 10 minutes. No calculator, no searching.",
      limit: 600,
      items: [
        { cat: "Deduction", q: "All roses are flowers. Some flowers fade quickly. Which statement must be true?", o: ["All roses fade quickly", "Some roses fade quickly", "No roses fade quickly", "None of these must be true"], a: 3 },
        { cat: "Series", q: "What comes next? 5, 11, 23, 47, …", o: ["94", "95", "96", "99"], a: 1 },
        { cat: "Coding", q: "If BOY is written as CPZ, how is GIRL written?", o: ["HJSM", "HJSL", "HKSM", "FHQK"], a: 0 },
        { cat: "Relationships", q: "Pointing at a photo, Ravi said: “She is the daughter of my grandfather's only son.” Who is she?", o: ["His cousin", "His sister", "His daughter", "His niece"], a: 1 },
        { cat: "Direction", q: "A man walks 5 km north, turns right and walks 3 km, then turns right and walks 5 km. How far is he from where he started?", o: ["3 km", "5 km", "8 km", "13 km"], a: 0 },
        { cat: "Series", q: "Which number does not belong? 8, 27, 64, 100, 125", o: ["27", "64", "100", "125"], a: 2 },
        { cat: "Deduction", q: "All Zips are Zaps. No Zaps are Zops. Which statement must be true?", o: ["Some Zips are Zops", "No Zips are Zops", "All Zops are Zips", "Nothing can be concluded"], a: 1 },
        { cat: "Series", q: "What comes next? B, D, G, K, …", o: ["N", "O", "P", "Q"], a: 2 },
        { cat: "Ordering", q: "Sam finished before Ali but after Kiran. Ali finished before Neha. Who finished last?", o: ["Kiran", "Sam", "Ali", "Neha"], a: 3 },
        { cat: "Deduction", q: "If it rains, the match is cancelled. The match was not cancelled. What follows?", o: ["It rained", "It did not rain", "The match was postponed", "Nothing follows"], a: 1 },
        { cat: "Relationships", q: "A is B's father. B is C's mother. How is A related to C?", o: ["Father", "Uncle", "Grandfather", "Brother"], a: 2 },
        { cat: "Ages", q: "Five years ago, Maya was twice as old as Riya. Maya is 25 today. How old is Riya now?", o: ["12", "15", "17", "20"], a: 1 }
      ],
      bands: [[4, 2, "Room to grow", "Logical reasoning improves with practice more than most people expect. Working through puzzles regularly makes a real difference."],
              [7, 1, "Average", "A solid result, in the range most people score. The harder items usually involve deduction, where everyday assumptions get in the way."],
              [10, 0, "Strong", "A strong result. You handle deduction and sequences well."],
              [12, 0, "Excellent", "An excellent result. You are comfortable with abstract reasoning under time pressure."]],
      related: ["iq-test", "verbal-reasoning-test"],
      source: "Puzzles written for this site for practice and curiosity. This is not a standardised aptitude test."
    },
    {
      slug: "verbal-reasoning-test", group: "brain", kind: "iq", minutes: 8,
      title: "Verbal Reasoning Test",
      short: "12 questions on word meaning, analogies and language sense.",
      tags: "verbal reasoning vocabulary english analogy words aptitude",
      intro: "You have 8 minutes. No dictionary or search.",
      limit: 480,
      items: [
        { cat: "Analogies", q: "Doctor is to hospital as teacher is to…", o: ["student", "school", "book", "lesson"], a: 1 },
        { cat: "Vocabulary", q: "Which word means the same as “abundant”?", o: ["scarce", "plentiful", "hidden", "rough"], a: 1 },
        { cat: "Vocabulary", q: "Which word is the opposite of “reluctant”?", o: ["willing", "hesitant", "tired", "silent"], a: 0 },
        { cat: "Classification", q: "Which one does not belong?", o: ["Sparrow", "Eagle", "Bat", "Parrot"], a: 2 },
        { cat: "Sentences", q: "Although she was exhausted, she ___ working.", o: ["stopped", "kept", "avoided", "refused"], a: 1 },
        { cat: "Analogies", q: "Ocean is to water as desert is to…", o: ["heat", "camel", "sand", "dry"], a: 2 },
        { cat: "Meaning", q: "What does “to let the cat out of the bag” mean?", o: ["To cause trouble", "To reveal a secret", "To escape quickly", "To waste time"], a: 1 },
        { cat: "Vocabulary", q: "Which word means the same as “meticulous”?", o: ["careless", "very careful", "hurried", "cheerful"], a: 1 },
        { cat: "Spelling", q: "Which word is spelled correctly?", o: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], a: 2 },
        { cat: "Analogies", q: "Book is to chapter as song is to…", o: ["melody", "verse", "singer", "album"], a: 1 },
        { cat: "Sentences", q: "The evidence was ___; nobody could argue with it.", o: ["ambiguous", "conclusive", "trivial", "doubtful"], a: 1 },
        { cat: "Vocabulary", q: "Which word is the opposite of “expand”?", o: ["enlarge", "contract", "develop", "widen"], a: 1 }
      ],
      bands: [[4, 2, "Room to grow", "Vocabulary is the most trainable part of verbal reasoning. Reading widely, and looking up words as you go, builds it faster than word lists."],
              [7, 1, "Average", "A solid result in the range most people score."],
              [10, 0, "Strong", "A strong command of word meaning and analogy."],
              [12, 0, "Excellent", "An excellent result. Your vocabulary and language sense are well above average."]],
      next: ["If English is not your first language, remember that this measures English vocabulary, not reasoning ability."],
      related: ["iq-test", "logical-reasoning-test"],
      source: "Questions written for this site for practice and curiosity. This is not a standardised aptitude test."
    },

    /* ===== Just for fun ===== */
    {
      slug: "astrology-test", group: "fun", kind: "survey", minutes: 2,
      title: "Astrology / Zodiac Sign Test",
      short: "Find your star sign and see the traits, strengths and best matches that go with it.",
      tags: "astrology zodiac horoscope star sign compatibility fun",
      intro: "This is just for fun. Astrology isn’t backed by science, and your result here says nothing about your mental health or personality in any tested sense.",
      items: [
        { q: "When’s your birthday?", o: opts([
          "21 Mar – 19 Apr (Aries)", "20 Apr – 20 May (Taurus)", "21 May – 20 Jun (Gemini)", "21 Jun – 22 Jul (Cancer)",
          "23 Jul – 22 Aug (Leo)", "23 Aug – 22 Sep (Virgo)", "23 Sep – 22 Oct (Libra)", "23 Oct – 21 Nov (Scorpio)",
          "22 Nov – 21 Dec (Sagittarius)", "22 Dec – 19 Jan (Capricorn)", "20 Jan – 18 Feb (Aquarius)", "19 Feb – 20 Mar (Pisces)"
        ]) },
        { q: "Which element do you feel most drawn to right now?", o: opts(["Fire", "Earth", "Air", "Water"]) },
        { q: "What are you most curious about right now?", o: opts(["Love and relationships", "Career and purpose", "Friendships and family", "Understanding myself better"]) }
      ],
      insights: function (a) {
        var z = ZODIAC[a[0]];
        if (!z) return [];
        var elements = ["Fire", "Earth", "Air", "Water"], drawnTo = elements[a[1]];
        var topics = ["love", "career", "friends", "self"], topicLabels = ["love and relationships", "career and purpose", "friendships and family", "understanding yourself"], topic = topics[a[2]];
        return [
          { tone: 0, title: z.sym + " " + z.name, text: z.name + " (" + z.dates + ") is a " + z.element + " sign, ruled by " + z.planet + ". People often describe " + z.name + " as " + z.traits + "." },
          { tone: 0, title: "Where " + z.name + " shines", text: z.strength },
          { tone: 0, title: "Worth watching", text: z.growth },
          { tone: 0, title: "Signs " + z.name + " often clicks with", text: "Traditionally, " + z.matches },
          { tone: 0, title: "You picked " + drawnTo, text: ELEMENT_TAKE[z.element][drawnTo] },
          { tone: 0, title: "On " + topicLabels[a[2]], text: TOPIC_TAKE[z.element][topic] }
        ];
      },
      related: ["personality-test", "introvert-extrovert-test"],
      source: "Written for this site using traditional Western zodiac associations. Astrology is not a scientific or psychological instrument, and this test is for entertainment only."
    }

  ];

  window.SCALES = S;

  /* ---------- Crisis lines. VERIFY BEFORE LAUNCH: numbers change. ---------- */
  window.HELPLINES = [
    { c: "INTL", n: "Another country", e: "your local emergency number", l: [["Find A Helpline: free, confidential support lines worldwide", "findahelpline.com", "https://findahelpline.com"], ["Befrienders Worldwide: emotional support centres", "befrienders.org", "https://befrienders.org"]] },
    { c: "AU", n: "Australia", e: "000", l: [["Lifeline", "13 11 14", "tel:131114"], ["Kids Helpline (ages 5–25)", "1800 55 1800", "tel:1800551800"]] },
    { c: "BR", n: "Brazil", e: "192", l: [["CVV – Centro de Valorização da Vida", "188", "tel:188"]] },
    { c: "CA", n: "Canada", e: "911", l: [["Suicide Crisis Helpline (call or text)", "988", "tel:988"], ["Kids Help Phone", "1-800-668-6868", "tel:18006686868"]] },
    { c: "FR", n: "France", e: "112", l: [["Numéro national de prévention du suicide", "3114", "tel:3114"]] },
    { c: "DE", n: "Germany", e: "112", l: [["TelefonSeelsorge", "0800 111 0 111", "tel:08001110111"], ["TelefonSeelsorge", "0800 111 0 222", "tel:08001110222"]] },
    { c: "IN", n: "India", e: "112", l: [["Tele-MANAS (24/7, many languages)", "14416", "tel:14416"], ["iCall (TISS)", "+91 9152987821", "tel:+919152987821"]] },
    { c: "IE", n: "Ireland", e: "112 or 999", l: [["Samaritans", "116 123", "tel:116123"], ["Pieta", "1800 247 247", "tel:1800247247"]] },
    { c: "IT", n: "Italy", e: "112", l: [["Telefono Amico Italia", "02 2327 2327", "tel:0223272327"]] },
    { c: "JP", n: "Japan", e: "119", l: [["TELL Lifeline (English)", "03-5774-0992", "tel:0357740992"]] },
    { c: "MY", n: "Malaysia", e: "999", l: [["Befrienders Kuala Lumpur", "03-7627 2929", "tel:0376272929"]] },
    { c: "MX", n: "Mexico", e: "911", l: [["Línea de la Vida", "800 911 2000", "tel:8009112000"]] },
    { c: "NL", n: "Netherlands", e: "112", l: [["113 Zelfmoordpreventie", "113 or 0800-0113", "tel:08000113"]] },
    { c: "NZ", n: "New Zealand", e: "111", l: [["Need to talk? (call or text)", "1737", "tel:1737"]] },
    { c: "PH", n: "Philippines", e: "911", l: [["NCMH Crisis Hotline", "1553", "tel:1553"]] },
    { c: "SG", n: "Singapore", e: "995", l: [["Samaritans of Singapore", "1767", "tel:1767"]] },
    { c: "ZA", n: "South Africa", e: "112", l: [["SADAG", "0800 567 567", "tel:0800567567"]] },
    { c: "ES", n: "Spain", e: "112", l: [["Línea 024", "024", "tel:024"]] },
    { c: "SE", n: "Sweden", e: "112", l: [["Mind Självmordslinjen", "90101", "tel:90101"]] },
    { c: "GB", n: "United Kingdom", e: "999", l: [["Samaritans", "116 123", "tel:116123"], ["Shout (text SHOUT)", "85258", "sms:85258"], ["NHS 111 (press 2 for mental health, England)", "111", "tel:111"]] },
    { c: "US", n: "United States", e: "911", l: [["988 Suicide & Crisis Lifeline (call or text)", "988", "tel:988"], ["Crisis Text Line (text HOME)", "741741", "sms:741741"]] }
  ];

  window.TZ_COUNTRY = {
    "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Berlin": "DE",
    "Europe/Paris": "FR", "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL", "Europe/Stockholm": "SE",
    "Asia/Tokyo": "JP", "Asia/Manila": "PH", "Asia/Singapore": "SG", "Asia/Kuala_Lumpur": "MY", "Africa/Johannesburg": "ZA",
    "America/Sao_Paulo": "BR", "America/Mexico_City": "MX", "America/Toronto": "CA", "America/Vancouver": "CA",
    "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA", "America/New_York": "US",
    "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US", "America/Phoenix": "US",
    "America/Anchorage": "US", "Pacific/Honolulu": "US", "Pacific/Auckland": "NZ"
  };
})();
