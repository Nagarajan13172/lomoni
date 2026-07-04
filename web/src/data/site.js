// All content scraped from lomonidesignstudio.com, structured for the app.

export const site = {
  name: "LOMONI Design Studio",
  tagline: "Road To D-School",
  mission: "We are bridging the gap between Students and Design Education.",
  email: "lomonidesignstudio@gmail.com",
  instagram: { handle: "@lomoni_design_studio", url: "https://instagram.com/lomoni_design_studio" },
  phones: [
    { label: "WhatsApp & Call", number: "+91 78450 69933", raw: "917845069933", whatsapp: true },
    { label: "Call", number: "+91 63800 85601", raw: "916380085601" },
    { label: "Call", number: "+91 95005 01647", raw: "919500501647" },
  ],
  address: {
    lines: ["D.No.7/16, Rajaram Nagar Road,", "Sahadevapuram, Salem — 636 007"],
    city: "Salem, Tamil Nadu, India",
  },
  hours: [
    { day: "Everyday (Online)", time: "8:00 am – 8:00 pm" },
    { day: "Saturday", time: "9:30 am – 7:00 pm" },
    { day: "Sunday", time: "9:30 am – 7:00 pm" },
  ],
  footerNote: "© 2023 by LOMONI Design Studio. Road To D-School",
};

export const nav = [
  { label: "Home", to: "/" },
  { label: "Road To D-School", to: "/r-2-d" },
  { label: "Courses", to: "/courses" },
  { label: "Pose Studio", to: "/studio" },
  { label: "Build", to: "/build" },
  { label: "Who We Are", to: "/who-we-are" },
  { label: "Contact", to: "/contact" },
];

export const home = {
  heroHeadline: ["Road", "to", "D-School"],
  heroSub:
    "An education program from LOMONI Design Studio for school and college students who want to take design as a career — a series of mentoring, guidance, and practice with fellow designers.",
  stats: [
    { value: "3", label: "Entrance exams covered" },
    { value: "6", label: "Degree tracks mentored" },
    { value: "NID·NIFT·IIT", label: "Alumni mentors" },
  ],
  whatWeDo:
    "We focus only on three design entrance exams — NID, NIFT and CEED/UCEED — for bachelor's and master's students. Individual training, workshops, skill development and portfolio building, guided by designers from NID and NIFT.",
  faqs: [
    {
      q: "What is a Design Entrance?",
      a: "Design entrance exams are different from any other entrance exam. These exams are focused on testing a student's creativity, logical thinking, sketching, and problem-solving skills.",
    },
    {
      q: "I don't have good drawing skills, will I be able to attend?",
      a: "Basic sketching skills are enough to take this exam.",
    },
    {
      q: "What is a Portfolio?",
      a: "Your portfolio is a collection of your work that shows your design ideas, skillset, knowledge and, most importantly, your approach and process.",
    },
  ],
};

export const r2d = {
  intro:
    "We are not just a coaching institute. It is a mentoring and career-guidance initiative run by LOMONI Design Studio, targeted at bridging the gap between students, design education and design careers.",
  intro2:
    "Road To D-School targets three design entrance exams — NID, NIFT and CEED/UCEED — for bachelor's and master's students.",
  pillars: [
    {
      no: "01",
      title: "Creative Ability & Design Aptitude",
      color: "var(--color-track-purple)",
      points: [
        "Visual & spatial ability",
        "Environmental and social awareness",
        "Design elements & principles",
        "Colour theory",
        "General knowledge",
      ],
    },
    {
      no: "02",
      title: "Skill Training in Drawing",
      color: "var(--color-track-green)",
      points: [
        "Fundamentals & shading",
        "Rendering & perspective",
        "Anatomy & composition",
        "Optical illusion techniques",
      ],
    },
    {
      no: "03",
      title: "Skill Training in Design",
      color: "var(--color-track-yellow)",
      points: [
        "Logo & poster design",
        "Product design",
        "Storyboarding & animation",
        "Interaction design basics",
      ],
    },
    {
      no: "04",
      title: "Workshops",
      color: "var(--color-track-blue)",
      points: [
        "Tools — Illustrator, Photoshop, Figma",
        "Material manipulation & model making",
        "Photography",
        "Portfolio creation & interview skills",
      ],
    },
  ],
};

export const whoWeAre = {
  about:
    "At once, we were also aspirants of design education — and now we are designers from the top design institutes in India. In our journey we learned many things in design and about design. One thing we learned is that awareness of design education and design careers among students and parents is minimal. So we are just trying to fill that knowledge gap between students and parents about design education in India.",
  tribute:
    "This initiation is a tribute to a wonderful human being, an excellent designer, and our beloved friend, Mr. Mothilal Loganathan, Master of Design, NID. He has also been an inspiration and mentor for us. This studio is seeded by his vision and his love for design. So we are here carrying his memories and ideology, while he is resting in peace.",
  closing: "We are trying to share our knowledge with one who seeks it. That's it.",
  team: [
    {
      name: "Deenadayalan C",
      role: "Product / Communication Designer",
      creds: ["M.Des Film & Video Communication Design — NID Ahmedabad", "B.E Mechanical Engineering — IRTT"],
      color: "var(--color-track-purple)",
    },
    {
      name: "Nandhini R",
      role: "Textile Designer",
      creds: ["M.Des Textile Design — NID Ahmedabad", "B.Des Textile Design — NIFT Chennai"],
      color: "var(--color-track-green)",
    },
    {
      name: "Sanjay K",
      role: "Animation Designer",
      creds: ["B.Des Animation Film Design — NID Ahmedabad"],
      color: "var(--color-track-blue)",
    },
  ],
};

export const contact = {
  heading: "Hello. Write any doubt you have related to design and design education.",
  blurb:
    "We offer free 40-minute online design-education counselling sessions — mostly scheduled on weekends, with weekday alternatives available over WhatsApp.",
  topics: ["Bachelor's", "Master's", "Design Career"],
  channels: ["Call", "Mail", "WhatsApp"],
};

// ---- Courses --------------------------------------------------------------
export const courseLevels = [
  {
    level: "Bachelor's",
    degree: "B.Des",
    blurb: "For students who have passed or are appearing for class 12, in any stream.",
    exams: ["nid-bachelors", "uceed", "nift-bachelors"],
  },
  {
    level: "Master's",
    degree: "M.Des",
    blurb: "For graduates and diploma holders ready to specialise in design.",
    exams: ["nid-masters", "ceed", "nift-masters"],
  },
];

export const courses = {
  "nid-bachelors": {
    id: "nid-bachelors",
    exam: "NID DAT",
    title: "NID — Bachelor's",
    degree: "B.Des",
    level: "Bachelor's",
    color: "var(--color-track-purple)",
    institute: "National Institute of Design",
    intro:
      "NID is internationally acclaimed as one of the finest educational and research institutions for Industrial, Communication, Textile and IT-Integrated (Experiential) Design — recognised as an Institution of National Importance.",
    eligibility:
      "Passed or currently appearing in the class 12 examination in any discipline (Science, Arts, Commerce, Humanities) from any recognised board such as CBSE, IB, ICSE or its equivalent.",
    pattern: ["Preliminary Test", "Studio Test", "Interview"],
    programs: [
      "Communication Design — Animation Film, Exhibition, Film & Video, Graphic",
      "Industrial Design — Ceramic & Glass, Product, Furniture",
      "Textile, Apparel, Lifestyle & Accessory Design",
    ],
    timeline: [
      ["October", "Applications open"],
      ["January", "Written exam"],
      ["February", "Prelim results"],
      ["Mar – May", "Studio test & interview"],
      ["May", "Final results"],
    ],
  },
  uceed: {
    id: "uceed",
    exam: "UCEED",
    title: "UCEED — IITs",
    degree: "B.Des",
    level: "Bachelor's",
    color: "var(--color-track-blue)",
    institute: "Undergraduate Common Entrance Exam for Design",
    intro:
      "The entrance test for the Bachelor of Design (B.Des) program at the IITs, conducted by IIT Bombay. Five IITs offer B.Des. Your UCEED score can also be used to apply to several private institutes.",
    eligibility:
      "Passed Class XII (or equivalent) in the previous year in all subjects, or appearing in the current year — in ANY stream.",
    pattern: ["Single stage · 3 hours", "Part A — computer based", "Part B — sketching"],
    programs: [
      "IIT Bombay — IDC School of Design",
      "IIT Delhi — Department of Design",
      "IIT Guwahati — Department of Design",
      "IIT Hyderabad — Department of Design",
      "IIITDM Jabalpur — Design Discipline",
    ],
    timeline: [
      ["Sep – Oct", "Applications open"],
      ["January", "Admit cards"],
      ["Jan – Feb", "Examination"],
      ["April", "Results"],
    ],
  },
  "nift-bachelors": {
    id: "nift-bachelors",
    exam: "NIFT B.Des",
    title: "NIFT — Bachelor's",
    degree: "B.Des / B.F.Tech",
    level: "Bachelor's",
    color: "var(--color-track-green)",
    institute: "National Institute of Fashion Technology",
    intro:
      "NIFT was established in 1986 under the Ministry of Textiles, Government of India, and is a premier fashion-education institution with 17 campuses across India.",
    eligibility:
      "Less than 24 years as of 1st August of the admission year (5-year relaxation for SC/ST/PWD). 10+2 from a recognised board; B.F.Tech additionally requires Physics & Mathematics.",
    pattern: ["B.Des — Creative Ability Test (CAT) + General Ability Test (GAT)", "B.F.Tech — GAT only", "Negative marking: 25% per wrong answer"],
    programs: [
      "Fashion Design",
      "Leather Design",
      "Accessory Design",
      "Textile Design",
      "Knitwear Design",
      "Fashion Communication",
      "B.F.Tech — Apparel Production",
    ],
    timeline: [
      ["January", "Applications open"],
      ["February", "Written exam"],
      ["March", "Results"],
      ["May", "Final results"],
      ["May – June", "Counselling"],
    ],
  },
  "nid-masters": {
    id: "nid-masters",
    exam: "NID DAT",
    title: "NID — Master's",
    degree: "M.Des",
    level: "Master's",
    color: "var(--color-track-purple)",
    institute: "National Institute of Design",
    intro:
      "NID's Master's programs span 5 faculty streams across 19 design domains, offered at Ahmedabad, Gandhinagar and Bangalore campuses.",
    eligibility:
      "A bachelor's degree from a recognised university, OR a four-year full-time diploma in design / fine arts / applied arts / architecture (post-secondary).",
    pattern: ["Preliminary Test", "Studio Test", "Interview"],
    programs: [
      "NID Ahmedabad",
      "NID Gandhinagar",
      "NID Bangalore",
      "5 faculty streams · 19 design domains",
    ],
    timeline: [
      ["October", "Applications open"],
      ["January", "Written exam"],
      ["February", "Prelim results"],
      ["May", "Studio test & interview"],
      ["May", "Final results"],
    ],
  },
  ceed: {
    id: "ceed",
    exam: "CEED",
    title: "CEED — IITs",
    degree: "M.Des",
    level: "Master's",
    color: "var(--color-track-blue)",
    institute: "Common Entrance Exam for Design",
    intro:
      "Conducted by IIT Bombay for Master's design programs across eight IITs and IISc Bangalore. No age limit, and you may attempt the exam multiple times.",
    eligibility:
      "A degree / diploma / post-graduate program of minimum three years (after 10+2), or currently enrolled in such a program.",
    pattern: ["Part A — 1 hr, 100 marks (NAT / MCQ / MSQ)", "Part B — 2 hrs, 5 questions (sketching, creativity, form & visual sensitivity, problem identification)"],
    programs: [
      "IDC IIT Bombay — Industrial, Communication, Animation, Interaction, Mobility Design",
      "IISc Bangalore",
      "IIT Delhi · Guwahati · Hyderabad · Kanpur",
      "IIITDM Jabalpur",
    ],
    timeline: [
      ["Sep – Oct", "Applications open"],
      ["Jan – Feb", "Examination"],
      ["March", "Results"],
    ],
  },
  "nift-masters": {
    id: "nift-masters",
    exam: "NIFT M.Des",
    title: "NIFT — Master's",
    degree: "M.Des / M.F.M / M.F.Tech",
    level: "Master's",
    color: "var(--color-track-green)",
    institute: "National Institute of Fashion Technology",
    intro:
      "NIFT's postgraduate programs — Master of Design, Master of Fashion Management and Master of Fashion Technology. No age limit.",
    eligibility:
      "M.Des / M.F.M — Undergraduate degree in any discipline, or a 3-year NIFT/NID diploma. M.F.Tech — B.F.Tech (NIFT) or B.E / B.Tech from a recognised institute.",
    pattern: ["Written — CAT + GAT (M.Des) / GAT (others)", "Shortlisted → Group Discussion + Personal Interview", "Negative marking: 25% per wrong answer"],
    programs: [
      "Master of Design (M.Des)",
      "Master of Fashion Management (M.F.M)",
      "Master of Fashion Technology (M.F.Tech)",
    ],
    timeline: [
      ["January", "Applications open"],
      ["February", "Written exam"],
      ["March", "Results"],
      ["April", "Interviews"],
      ["May – June", "Final & counselling"],
    ],
  },
};

export const courseList = Object.values(courses);
