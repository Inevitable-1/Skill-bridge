const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const SALT_ROUNDS = 12;
const DEMO_PASSWORD = 'Password@2026';
const ADMIN_PASSWORD = 'Admin@2026';

const skills = [
  'Java', 'Python', 'React', 'Node.js', 'Spring Boot', 'Machine Learning',
  'Data Structures', 'DBMS', 'Operating Systems', 'Cloud', 'Cyber Security',
  'UI UX', 'DevOps', 'AI', 'TypeScript', 'C++', 'SQL', 'MongoDB',
  'Docker', 'AWS', 'Git', 'HTML/CSS', 'Tailwind CSS', 'Express.js',
  'PostgreSQL', 'Data Analysis', 'REST APIs', 'GraphQL', 'Angular',
  'Vue.js', 'Flutter', 'Redis', 'Kubernetes', 'CI/CD', 'Linux',
  'System Design', 'Algorithms', 'Problem Solving', 'Next.js', 'Go', 'Rust'
];

const colleges = [
  'JNTU Hyderabad', 'VIT Vellore', 'SRM University', 'IIIT Hyderabad',
  'Osmania University', 'Andhra University', 'KL University',
  'VR Siddhartha Engineering College', 'GVP College of Engineering',
  'Malla Reddy Engineering College', 'CVR College of Engineering',
  'Mahatma Gandhi Institute of Technology', 'Narayanamma Institute of Technology',
  'Vasavi College of Engineering', 'BVRIT College of Engineering',
  'CVR College of Engineering', 'RGUKT Nuzvid', 'Siddhartha Institute',
  'GRIET', 'HITAM Engineering College'
];

const universities = [
  'JNTUH', 'JNTUK', 'ANU', 'OU', 'SVU', 'SKU', 'Andhra University',
  'JNTU Anantapur', 'JNTU Kakinada'
];

const userSkills = {
  mentors: [
    ['Java', 'Spring Boot', 'Data Structures', 'Algorithms'],
    ['React', 'Node.js', 'TypeScript', 'Next.js'],
    ['Python', 'Machine Learning', 'AI', 'Data Analysis'],
    ['Cloud', 'DevOps', 'AWS', 'Docker', 'Kubernetes'],
    ['UI UX', 'HTML/CSS', 'Tailwind CSS', 'Angular'],
    ['SQL', 'PostgreSQL', 'DBMS', 'MongoDB'],
    ['Cyber Security', 'Linux', 'Operating Systems'],
    ['Go', 'Rust', 'System Design', 'Algorithms'],
    ['Flutter', 'TypeScript', 'Node.js'],
    ['Angular', 'Vue.js', 'React', 'Node.js']
  ],
  developers: [
    ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    ['Python', 'Machine Learning', 'AI', 'Data Analysis'],
    ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    ['Flutter', 'React', 'TypeScript'],
    ['Java', 'Spring Boot', 'Docker', 'Kubernetes'],
    ['React', 'GraphQL', 'AWS', 'Node.js'],
    ['DevOps', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    ['Angular', 'TypeScript', 'Node.js'],
    ['Go', 'System Design', 'Algorithms'],
    ['Vue.js', 'Tailwind CSS', 'UI UX', 'HTML/CSS']
  ],
  students: [
    ['React', 'Python', 'Git'],
    ['Java', 'Data Structures', 'Problem Solving'],
    ['Python', 'Machine Learning', 'AI'],
    ['Flutter', 'React', 'Node.js'],
    ['Node.js', 'Express.js', 'MongoDB'],
    ['Java', 'Spring Boot', 'AWS'],
    ['Python', 'SQL', 'DBMS'],
    ['React', 'TypeScript', 'Next.js'],
    ['Go', 'System Design', 'Docker'],
    ['Angular', 'Vue.js', 'Tailwind CSS'],
    ['Python', 'Data Analysis', 'Machine Learning'],
    ['Java', 'Spring Boot', 'Microservices'],
    ['React', 'GraphQL', 'PostgreSQL'],
    ['Flutter', 'Dart', 'Firebase'],
    ['Python', 'Django', 'Redis'],
    ['TypeScript', 'Node.js', 'Express.js'],
    ['Java', 'Algorithms', 'Data Structures'],
    ['React', 'Tailwind CSS', 'Firebase'],
    ['Go', 'gRPC', 'Linux'],
    ['Vue.js', 'HTML/CSS', 'Git']
  ]
};

const mentors = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@skillbridge.com',
    phone: '9876543001',
    gender: 'female',
    college: 'IIIT Hyderabad',
    university: 'JNTUH',
    degree: 'M.Tech Computer Science',
    qualification: 'M.Tech Computer Science from IIIT Hyderabad',
    years_experience: 5,
    bio: 'Senior Java developer with 5 years of experience in enterprise applications. Passionate about teaching DSA and Spring Boot.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/priyasharma',
    linkedin_url: 'https://linkedin.com/in/priyasharma',
    availability_days: ['monday', 'wednesday', 'friday'],
    availability_time: '6:00 PM - 9:00 PM',
    programming_languages: ['Java', 'Python', 'SQL']
  },
  {
    name: 'Rahul Reddy',
    email: 'rahul.reddy@skillbridge.com',
    phone: '9876543002',
    gender: 'male',
    college: 'VIT Vellore',
    university: 'VIT',
    degree: 'B.Tech Information Technology',
    qualification: 'B.Tech IT from VIT Vellore',
    years_experience: 4,
    bio: 'Full-stack developer specializing in React and Node.js. Love building scalable web applications.',
    location: 'Vellore, Tamil Nadu',
    github_url: 'https://github.com/rahulreddy',
    linkedin_url: 'https://linkedin.com/in/rahulreddy',
    availability_days: ['tuesday', 'thursday', 'saturday'],
    availability_time: '5:00 PM - 8:00 PM',
    programming_languages: ['JavaScript', 'TypeScript', 'Python']
  },
  {
    name: 'Ananya Patel',
    email: 'ananya.patel@skillbridge.com',
    phone: '9876543003',
    gender: 'female',
    college: 'SRM University',
    university: 'SRM',
    degree: 'M.Tech Artificial Intelligence',
    qualification: 'M.Tech AI from SRM University',
    years_experience: 6,
    bio: 'ML engineer and AI researcher. Completed 50+ ML projects. Passionate about data science.',
    location: 'Chennai, Tamil Nadu',
    github_url: 'https://github.com/ananyapatel',
    linkedin_url: 'https://linkedin.com/in/ananyapatel',
    availability_days: ['monday', 'tuesday', 'thursday'],
    availability_time: '7:00 PM - 10:00 PM',
    programming_languages: ['Python', 'R', 'Julia']
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@skillbridge.com',
    phone: '9876543004',
    gender: 'male',
    college: 'JNTU Hyderabad',
    university: 'JNTUH',
    degree: 'B.Tech Computer Science',
    qualification: 'B.Tech CSE from JNTU Hyderabad',
    years_experience: 7,
    bio: 'Cloud architect and DevOps engineer. AWS certified with extensive experience in CI/CD pipelines.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/vikramsingh',
    linkedin_url: 'https://linkedin.com/in/vikramsingh',
    availability_days: ['wednesday', 'friday', 'sunday'],
    availability_time: '4:00 PM - 7:00 PM',
    programming_languages: ['Python', 'Go', 'Bash']
  },
  {
    name: 'Sneha Nair',
    email: 'sneha.nair@skillbridge.com',
    phone: '9876543005',
    gender: 'female',
    college: 'KL University',
    university: 'JNTUK',
    degree: 'BCA',
    qualification: 'BCA from KL University',
    years_experience: 3,
    bio: 'UI/UX designer and frontend developer. Passionate about creating beautiful user experiences.',
    location: 'Vijayawada, Andhra Pradesh',
    github_url: 'https://github.com/snehanair',
    linkedin_url: 'https://linkedin.com/in/snehanair',
    availability_days: ['monday', 'wednesday', 'saturday'],
    availability_time: '6:00 PM - 9:00 PM',
    programming_languages: ['JavaScript', 'TypeScript', 'HTML']
  },
  {
    name: 'Arjun Kumar',
    email: 'arjun.kumar@skillbridge.com',
    phone: '9876543006',
    gender: 'male',
    college: 'Osmania University',
    university: 'OU',
    degree: 'MCA',
    qualification: 'MCA from Osmania University',
    years_experience: 5,
    bio: 'Database specialist with expertise in PostgreSQL and MongoDB. Love optimizing queries and designing schemas.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/arjunkumar',
    linkedin_url: 'https://linkedin.com/in/arjunkumar',
    availability_days: ['tuesday', 'thursday', 'saturday'],
    availability_time: '5:00 PM - 8:00 PM',
    programming_languages: ['SQL', 'Python', 'Java']
  },
  {
    name: 'Deepa Menon',
    email: 'deepa.menon@skillbridge.com',
    phone: '9876543007',
    gender: 'female',
    college: 'Andhra University',
    university: 'Andhra University',
    degree: 'M.Tech Cyber Security',
    qualification: 'M.Tech Cyber Security from Andhra University',
    years_experience: 8,
    bio: 'Cyber security expert and ethical hacker. 8 years of experience in network security and penetration testing.',
    location: 'Visakhapatnam, Andhra Pradesh',
    github_url: 'https://github.com/deepamemon',
    linkedin_url: 'https://linkedin.com/in/deepamemon',
    availability_days: ['monday', 'friday', 'sunday'],
    availability_time: '3:00 PM - 6:00 PM',
    programming_languages: ['Python', 'Bash', 'C']
  },
  {
    name: 'Karthik Iyer',
    email: 'karthik.iyer@skillbridge.com',
    phone: '9876543008',
    gender: 'male',
    college: 'VR Siddhartha Engineering College',
    university: 'JNTUK',
    degree: 'B.Tech Computer Science',
    qualification: 'B.Tech CSE from VR Siddhartha',
    years_experience: 4,
    bio: 'Systems programmer specializing in Go and Rust. Passionate about distributed systems and system design.',
    location: 'Vijayawada, Andhra Pradesh',
    github_url: 'https://github.com/karthikiyer',
    linkedin_url: 'https://linkedin.com/in/karthikiyer',
    availability_days: ['tuesday', 'wednesday', 'friday'],
    availability_time: '6:00 PM - 9:00 PM',
    programming_languages: ['Go', 'Rust', 'C++']
  },
  {
    name: 'Meera Joshi',
    email: 'meera.joshi@skillbridge.com',
    phone: '9876543009',
    gender: 'female',
    college: 'Malla Reddy Engineering College',
    university: 'JNTUH',
    degree: 'B.Tech Information Technology',
    qualification: 'B.Tech IT from Malla Reddy Engineering College',
    years_experience: 3,
    bio: 'Mobile app developer specializing in Flutter and Dart. Built 15+ apps for various industries.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/meerajoshi',
    linkedin_url: 'https://linkedin.com/in/meerajoshi',
    availability_days: ['monday', 'tuesday', 'thursday'],
    availability_time: '5:00 PM - 8:00 PM',
    programming_languages: ['Dart', 'JavaScript', 'Kotlin']
  },
  {
    name: 'Ravi Teja',
    email: 'ravi.teja@skillbridge.com',
    phone: '9876543010',
    gender: 'male',
    college: 'GVP College of Engineering',
    university: 'JNTUK',
    degree: 'M.Tech Software Engineering',
    qualification: 'M.Tech SE from GVP College of Engineering',
    years_experience: 5,
    bio: 'Full-stack developer with expertise in Angular and Vue.js. Love building robust web applications.',
    location: 'Visakhapatnam, Andhra Pradesh',
    github_url: 'https://github.com/raviteja',
    linkedin_url: 'https://linkedin.com/in/raviteja',
    availability_days: ['wednesday', 'saturday', 'sunday'],
    availability_time: '4:00 PM - 7:00 PM',
    programming_languages: ['TypeScript', 'JavaScript', 'Python']
  }
];

const developers = [
  {
    name: 'Siddharth Naidu',
    email: 'sid.naidu@skillbridge.com',
    phone: '9876543101',
    gender: 'male',
    college: 'Vasavi College of Engineering',
    university: 'OU',
    degree: 'B.Tech Computer Science',
    years_experience: 3,
    bio: 'Frontend specialist with expertise in React and Next.js. Building modern web experiences.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/sidnaidu',
    linkedin_url: 'https://linkedin.com/in/sidnaidu'
  },
  {
    name: 'Lakshmi Reddy',
    email: 'lakshmi.r@skillbridge.com',
    phone: '9876543102',
    gender: 'female',
    college: 'BVRIT College of Engineering',
    university: 'JNTUH',
    degree: 'B.Tech Information Technology',
    years_experience: 2,
    bio: 'Python developer and ML enthusiast. Working on data-driven applications.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/lakshmireddy',
    linkedin_url: 'https://linkedin.com/in/lakshmireddy'
  },
  {
    name: 'Pranav Sharma',
    email: 'pranav.s@skillbridge.com',
    phone: '9876543103',
    gender: 'male',
    college: 'CVR College of Engineering',
    university: 'JNTUH',
    degree: 'B.Tech Computer Science',
    years_experience: 4,
    bio: 'Backend specialist with deep expertise in Node.js and MongoDB. Building scalable APIs.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/pranavsharma',
    linkedin_url: 'https://linkedin.com/in/pranavsharma'
  },
  {
    name: 'Divya Patel',
    email: 'divya.p@skillbridge.com',
    phone: '9876543104',
    gender: 'female',
    college: 'HITAM Engineering College',
    university: 'JNTUH',
    degree: 'B.Tech Computer Science',
    years_experience: 2,
    bio: 'Mobile app developer specializing in Flutter and Firebase.',
    location: 'Warangal, Telangana',
    github_url: 'https://github.com/divyapatel',
    linkedin_url: 'https://linkedin.com/in/divyapatel'
  },
  {
    name: 'Nikhil Verma',
    email: 'nikhil.v@skillbridge.com',
    phone: '9876543105',
    gender: 'male',
    college: 'SRM University',
    university: 'SRM',
    degree: 'B.Tech Computer Science',
    years_experience: 3,
    bio: 'Java developer with expertise in microservices and Spring Boot.',
    location: 'Chennai, Tamil Nadu',
    github_url: 'https://github.com/nikhilverma',
    linkedin_url: 'https://linkedin.com/in/nikhilverma'
  },
  {
    name: 'Aisha Khan',
    email: 'aisha.k@skillbridge.com',
    phone: '9876543106',
    gender: 'female',
    college: 'Mahatma Gandhi Institute of Technology',
    university: 'JNTUH',
    degree: 'B.Tech Information Technology',
    years_experience: 3,
    bio: 'Full-stack developer with React and AWS expertise.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/aishakhan',
    linkedin_url: 'https://linkedin.com/in/aishakhan'
  },
  {
    name: 'Varun Reddy',
    email: 'varun.r@skillbridge.com',
    phone: '9876543107',
    gender: 'male',
    college: 'Narayanamma Institute of Technology',
    university: 'JNTUH',
    degree: 'B.Tech Computer Science',
    years_experience: 4,
    bio: 'DevOps engineer specializing in Docker and Kubernetes. Cloud infrastructure enthusiast.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/varunreddy',
    linkedin_url: 'https://linkedin.com/in/varunreddy'
  },
  {
    name: 'Shruti Menon',
    email: 'shruti.m@skillbridge.com',
    phone: '9876543108',
    gender: 'female',
    college: 'KL University',
    university: 'JNTUK',
    degree: 'B.Tech Computer Science',
    years_experience: 2,
    bio: 'Angular developer with a passion for building enterprise applications.',
    location: 'Vijayawada, Andhra Pradesh',
    github_url: 'https://github.com/shrutimenon',
    linkedin_url: 'https://linkedin.com/in/shrutimenon'
  },
  {
    name: 'Aditya Singh',
    email: 'aditya.s@skillbridge.com',
    phone: '9876543109',
    gender: 'male',
    college: 'IIIT Hyderabad',
    university: 'JNTUH',
    degree: 'B.Tech Computer Science',
    years_experience: 3,
    bio: 'Systems programmer specializing in Go and gRPC. Passionate about distributed systems.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com/adityasingh',
    linkedin_url: 'https://linkedin.com/in/adityasingh'
  },
  {
    name: 'Neha Gupta',
    email: 'neha.g@skillbridge.com',
    phone: '9876543110',
    gender: 'female',
    college: 'GRIET',
    university: 'JNTUH',
    degree: 'B.Tech Information Technology',
    years_experience: 2,
    bio: 'Frontend developer and UI/UX designer. Creating beautiful and functional interfaces.',
    location: 'Hyderabad, Telangana',
    github_url: 'https://github.com nehagupta',
    linkedin_url: 'https://linkedin.com/in/nehagupta'
  }
];

const students = [
  {
    name: 'Sai Krishna',
    email: 'saikrishna@skillbridge.com',
    phone: '9876544001',
    gender: 'male',
    college: 'JNTU Hyderabad',
    university: 'JNTUH',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 3,
    cgpa: 8.5,
    bio: 'Passionate about web development and problem solving.',
    programming_languages: ['C', 'C++', 'Java', 'Python']
  },
  {
    name: 'Pavan Kumar',
    email: 'pavan.kumar@skillbridge.com',
    phone: '9876544002',
    gender: 'male',
    college: 'VIT Vellore',
    university: 'VIT',
    degree: 'B.Tech IT',
    branch: 'IT',
    year: 2,
    cgpa: 9.2,
    bio: 'Learning full-stack development. Interested in React and Node.js.',
    programming_languages: ['C', 'JavaScript', 'Python']
  },
  {
    name: 'Shreya',
    email: 'shreya@skillbridge.com',
    phone: '9876544003',
    gender: 'female',
    college: 'SRM University',
    university: 'SRM',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 4,
    cgpa: 9.5,
    bio: 'AI enthusiast looking to build a career in machine learning.',
    programming_languages: ['Python', 'R', 'Java']
  },
  {
    name: 'Ravi',
    email: 'ravi@skillbridge.com',
    phone: '9876544004',
    gender: 'male',
    college: 'Andhra University',
    university: 'Andhra University',
    degree: 'B.Tech ECE',
    branch: 'ECE',
    year: 3,
    cgpa: 7.8,
    bio: 'Want to learn mobile app development.',
    programming_languages: ['C', 'C++', 'Python']
  },
  {
    name: 'Anjali',
    email: 'anjali@skillbridge.com',
    phone: '9876544005',
    gender: 'female',
    college: 'KL University',
    university: 'JNTUK',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 2,
    cgpa: 8.9,
    bio: 'Interested in cloud computing and DevOps.',
    programming_languages: ['Python', 'Java', 'Bash']
  },
  {
    name: 'Suresh',
    email: 'suresh@skillbridge.com',
    phone: '9876544006',
    gender: 'male',
    college: 'Osmania University',
    university: 'OU',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 4,
    cgpa: 8.1,
    bio: 'Preparing for placements. Need help with DSA and system design.',
    programming_languages: ['Java', 'C++', 'Python']
  },
  {
    name: 'Kavitha',
    email: 'kavitha@skillbridge.com',
    phone: '9876544007',
    gender: 'female',
    college: 'VR Siddhartha Engineering College',
    university: 'JNTUK',
    degree: 'B.Tech IT',
    branch: 'IT',
    year: 3,
    cgpa: 9.0,
    bio: 'Aspiring data scientist. Love working with data.',
    programming_languages: ['Python', 'R', 'SQL']
  },
  {
    name: 'Manikanth',
    email: 'manikanth@skillbridge.com',
    phone: '9876544008',
    gender: 'male',
    college: 'GVP College of Engineering',
    university: 'JNTUK',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 2,
    cgpa: 7.5,
    bio: 'Just started learning programming. Eager to improve.',
    programming_languages: ['C', 'Python']
  },
  {
    name: 'Pratyusha',
    email: 'pratyusha@skillbridge.com',
    phone: '9876544009',
    gender: 'female',
    college: 'Malla Reddy Engineering College',
    university: 'JNTUH',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 3,
    cgpa: 8.7,
    bio: 'Full-stack developer in training. Love building projects.',
    programming_languages: ['JavaScript', 'Python', 'C++']
  },
  {
    name: 'Mohan',
    email: 'mohan@skillbridge.com',
    phone: '9876544010',
    gender: 'male',
    college: 'CVR College of Engineering',
    university: 'JNTUH',
    degree: 'B.Tech ECE',
    branch: 'ECE',
    year: 2,
    cgpa: 7.2,
    bio: 'Interested in IoT and embedded systems.',
    programming_languages: ['C', 'C++', 'Python']
  },
  {
    name: 'Harsha',
    email: 'harsha@skillbridge.com',
    phone: '9876544011',
    gender: 'male',
    college: 'IIIT Hyderabad',
    university: 'JNTUH',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 4,
    cgpa: 9.8,
    bio: 'Competitive programmer. Love solving algorithmic problems.',
    programming_languages: ['C++', 'Java', 'Python']
  },
  {
    name: 'Deepika',
    email: 'deepika@skillbridge.com',
    phone: '9876544012',
    gender: 'female',
    college: 'BVRIT College of Engineering',
    university: 'JNTUH',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 2,
    cgpa: 8.3,
    bio: 'Frontend development enthusiast. Learning React.',
    programming_languages: ['JavaScript', 'HTML', 'C++']
  },
  {
    name: 'Kiran',
    email: 'kiran@skillbridge.com',
    phone: '9876544013',
    gender: 'male',
    college: 'HITAM Engineering College',
    university: 'JNTUH',
    degree: 'B.Tech IT',
    branch: 'IT',
    year: 3,
    cgpa: 8.0,
    bio: 'Backend developer in training. Interested in Node.js.',
    programming_languages: ['JavaScript', 'Python', 'Java']
  },
  {
    name: 'Swathi',
    email: 'swathi@skillbridge.com',
    phone: '9876544014',
    gender: 'female',
    college: 'Vasavi College of Engineering',
    university: 'OU',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 4,
    cgpa: 9.1,
    bio: 'Web development and UI/UX design enthusiast.',
    programming_languages: ['JavaScript', 'HTML', 'CSS', 'Python']
  },
  {
    name: 'Ajay',
    email: 'ajay@skillbridge.com',
    phone: '9876544015',
    gender: 'male',
    college: 'Mahatma Gandhi Institute of Technology',
    university: 'JNTUH',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 1,
    cgpa: 7.0,
    bio: 'Freshman eager to learn programming from scratch.',
    programming_languages: ['C', 'Python']
  },
  {
    name: 'Divya',
    email: 'divya@skillbridge.com',
    phone: '9876544016',
    gender: 'female',
    college: 'Narayanamma Institute of Technology',
    university: 'JNTUH',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 3,
    cgpa: 8.6,
    bio: 'Mobile app developer. Love creating Flutter apps.',
    programming_languages: ['Dart', 'JavaScript', 'Python']
  },
  {
    name: 'Rajesh',
    email: 'rajesh@skillbridge.com',
    phone: '9876544017',
    gender: 'male',
    college: 'SRM University',
    university: 'SRM',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 2,
    cgpa: 7.9,
    bio: 'Cybersecurity enthusiast. Want to learn ethical hacking.',
    programming_languages: ['Python', 'Bash', 'C']
  },
  {
    name: 'Sneha',
    email: 'sneha@skillbridge.com',
    phone: '9876544018',
    gender: 'female',
    college: 'KL University',
    university: 'JNTUK',
    degree: 'B.Tech IT',
    branch: 'IT',
    year: 4,
    cgpa: 9.3,
    bio: 'Cloud computing and DevOps enthusiast.',
    programming_languages: ['Python', 'Bash', 'Java']
  },
  {
    name: 'Venkat',
    email: 'venkat@skillbridge.com',
    phone: '9876544019',
    gender: 'male',
    college: 'Andhra University',
    university: 'Andhra University',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 3,
    cgpa: 8.2,
    bio: 'System design and distributed systems enthusiast.',
    programming_languages: ['Java', 'Go', 'C++']
  },
  {
    name: 'Navya',
    email: 'navya@skillbridge.com',
    phone: '9876544020',
    gender: 'female',
    college: 'Osmania University',
    university: 'OU',
    degree: 'B.Tech CSE',
    branch: 'CSE',
    year: 2,
    cgpa: 8.8,
    bio: 'Aspiring UI/UX designer with frontend development skills.',
    programming_languages: ['JavaScript', 'HTML', 'CSS', 'Python']
  }
];

const sessionTypes = ['quick_doubt', 'learning', 'project_guidance', 'interview_prep'];

const getAvailabilityJSON = (days) => {
  const all = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };
  days.forEach(day => {
    all[day] = [{ start: '18:00', end: '20:00' }];
  });
  return JSON.stringify(all);
};

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed skills
    for (const skillName of skills) {
      await client.query(
        'INSERT INTO skills (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [skillName, null]
      );
    }
    console.log(`Seeded ${skills.length} skills`);

    // Build skill lookup map
    const skillMap = {};
    const skillRows = await client.query('SELECT id, name FROM skills');
    for (const row of skillRows.rows) {
      skillMap[row.name] = row.id;
    }

    // 2. Seed admin accounts
    const adminSalt = await bcrypt.genSalt(SALT_ROUNDS);
    const adminHashed = await bcrypt.hash(ADMIN_PASSWORD, adminSalt);

    const adminUsers = [
      {
        name: 'Manoj',
        email: 'mr.manojmanu05@gmail.com',
        bio: 'Platform administrator managing SkillBridge operations. Full-stack developer passionate about education.',
        phone: '9876543999',
        gender: 'male',
        college: 'IIIT Hyderabad',
        university: 'JNTUH',
        qualification: 'M.Tech Computer Science'
      },
      {
        name: 'Navya Sree',
        email: 'jagarlamudi.navyasree@gmail.com',
        bio: 'Platform administrator managing SkillBridge operations. Dedicated to helping students succeed.',
        phone: '9876543998',
        gender: 'female',
        college: 'JNTU Hyderabad',
        university: 'JNTUH',
        qualification: 'B.Tech Information Technology'
      }
    ];

    for (const admin of adminUsers) {
      await client.query(
        `INSERT INTO users (name, email, password, role, bio, phone, gender, college, university, qualification, is_verified, account_status)
         VALUES ($1, $2, $3, 'admin', $4, $5, $6, $7, $8, $9, true, 'active')
         ON CONFLICT (email) DO UPDATE SET password = $3, role = 'admin', account_status = 'active', is_verified = true`,
        [admin.name, admin.email, adminHashed, admin.bio, admin.phone, admin.gender, admin.college, admin.university, admin.qualification]
      );
    }
    console.log(`Seeded ${adminUsers.length} admin accounts`);

    // 3. Seed mentor accounts
    const demoSalt = await bcrypt.genSalt(SALT_ROUNDS);
    const demoHashed = await bcrypt.hash(DEMO_PASSWORD, demoSalt);

    const mentorIds = [];
    for (let i = 0; i < mentors.length; i++) {
      const m = mentors[i];
      const avail = getAvailabilityJSON(
        m.availability_days.map(d => d.toLowerCase())
      );
      const result = await client.query(
        `INSERT INTO users (name, email, password, role, bio, phone, gender, college, university, degree, qualification,
         years_experience, location, github_url, linkedin_url, availability, availability_days, availability_time,
         programming_languages, is_verified, account_status)
         VALUES ($1, $2, $3, 'senior', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, 'approved')
         ON CONFLICT (email) DO UPDATE SET
           role = 'senior', account_status = 'approved', is_verified = true,
           password = $3, years_experience = $11, qualification = $10
         RETURNING id`,
        [
          m.name, m.email, demoHashed, m.bio, m.phone, m.gender,
          m.college, m.university, m.degree, m.qualification,
          m.years_experience, m.location, m.github_url, m.linkedin_url,
          avail, m.availability_days, m.availability_time,
          m.programming_languages
        ]
      );

      const userId = result.rows[0].id;
      mentorIds.push(userId);

      // Add skills offered
      for (const skillName of userSkills.mentors[i]) {
        const skillId = skillMap[skillName];
        if (skillId) {
          await client.query(
            'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, \'offered\') ON CONFLICT DO NOTHING',
            [userId, skillId]
          );
        }
      }
    }
    console.log(`Seeded ${mentors.length} mentor accounts`);

    // 4. Seed developer accounts
    const devIds = [];
    for (let i = 0; i < developers.length; i++) {
      const d = developers[i];
      const result = await client.query(
        `INSERT INTO users (name, email, password, role, bio, phone, gender, college, university, degree,
         years_experience, location, github_url, linkedin_url, is_verified, account_status)
         VALUES ($1, $2, $3, 'developer', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, 'approved')
         ON CONFLICT (email) DO UPDATE SET
           role = 'developer', account_status = 'approved', is_verified = true,
           password = $3, years_experience = $10
         RETURNING id`,
        [
          d.name, d.email, demoHashed, d.bio, d.phone, d.gender,
          d.college, d.university, d.degree,
          d.years_experience, d.location, d.github_url, d.linkedin_url
        ]
      );

      const userId = result.rows[0].id;
      devIds.push(userId);

      // Add skills offered
      for (const skillName of userSkills.developers[i]) {
        const skillId = skillMap[skillName];
        if (skillId) {
          await client.query(
            'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, \'offered\') ON CONFLICT DO NOTHING',
            [userId, skillId]
          );
        }
      }
    }
    console.log(`Seeded ${developers.length} developer accounts`);

    // 5. Seed student accounts
    const studentIds = [];
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const result = await client.query(
        `INSERT INTO users (name, email, password, role, branch, year, bio, phone, gender, college, university,
         degree, cgpa, programming_languages, is_verified, account_status)
         VALUES ($1, $2, $3, 'junior', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, 'active')
         ON CONFLICT (email) DO UPDATE SET
           role = 'junior', account_status = 'active', is_verified = true,
           password = $3, year = $5, cgpa = $12
         RETURNING id`,
        [
          s.name, s.email, demoHashed, s.branch, s.year, s.bio,
          s.phone, s.gender, s.college, s.university, s.degree,
          s.cgpa, s.programming_languages
        ]
      );

      const userId = result.rows[0].id;
      studentIds.push(userId);

      // Add skills needed
      for (const skillName of userSkills.students[i]) {
        const skillId = skillMap[skillName];
        if (skillId) {
          await client.query(
            'INSERT INTO user_skills (user_id, skill_id, type) VALUES ($1, $2, \'needed\') ON CONFLICT DO NOTHING',
            [userId, skillId]
          );
        }
      }
    }
    console.log(`Seeded ${students.length} student accounts`);

    // 6. Seed sessions
    const sessionData = [
      // 8 completed sessions
      { mentorIdx: 0, studentIdx: 0, skill: 'Java', type: 'learning', status: 'completed', daysAgo: 30, duration: 60 },
      { mentorIdx: 1, studentIdx: 1, skill: 'React', type: 'learning', status: 'completed', daysAgo: 25, duration: 90 },
      { mentorIdx: 2, studentIdx: 2, skill: 'Machine Learning', type: 'project_guidance', status: 'completed', daysAgo: 20, duration: 120 },
      { mentorIdx: 5, studentIdx: 6, skill: 'SQL', type: 'quick_doubt', status: 'completed', daysAgo: 18, duration: 30 },
      { mentorIdx: 3, studentIdx: 4, skill: 'AWS', type: 'learning', status: 'completed', daysAgo: 15, duration: 60 },
      { mentorIdx: 4, studentIdx: 12, skill: 'UI UX', type: 'project_guidance', status: 'completed', daysAgo: 12, duration: 60 },
      { mentorIdx: 6, studentIdx: 17, skill: 'Linux', type: 'learning', status: 'completed', daysAgo: 10, duration: 60 },
      { mentorIdx: 9, studentIdx: 13, skill: 'Angular', type: 'interview_prep', status: 'completed', daysAgo: 8, duration: 90 },
      // 4 pending sessions
      { mentorIdx: 0, studentIdx: 5, skill: 'Data Structures', type: 'interview_prep', status: 'pending', daysFromNow: 3, duration: 60 },
      { mentorIdx: 7, studentIdx: 8, skill: 'System Design', type: 'learning', status: 'pending', daysFromNow: 5, duration: 90 },
      { mentorIdx: 8, studentIdx: 15, skill: 'Flutter', type: 'learning', status: 'pending', daysFromNow: 4, duration: 60 },
      { mentorIdx: 1, studentIdx: 11, skill: 'Node.js', type: 'project_guidance', status: 'pending', daysFromNow: 7, duration: 60 },
      // 3 approved sessions
      { mentorIdx: 2, studentIdx: 3, skill: 'Python', type: 'learning', status: 'approved', daysFromNow: 2, duration: 60 },
      { mentorIdx: 3, studentIdx: 17, skill: 'Docker', type: 'quick_doubt', status: 'approved', daysFromNow: 1, duration: 30 },
      { mentorIdx: 5, studentIdx: 9, skill: 'MongoDB', type: 'learning', status: 'approved', daysFromNow: 4, duration: 60 }
    ];

    const sessionIds = [];
    for (const s of sessionData) {
      const date = s.daysAgo
        ? new Date(Date.now() - s.daysAgo * 86400000)
        : new Date(Date.now() + s.daysFromNow * 86400000);

      const skillId = skillMap[s.skill];
      const meetingLink = `https://meet.skillbridge.com/${Math.random().toString(36).substring(2, 10)}`;
      const notes = s.status === 'completed' ? 'Session completed successfully. Good progress made.' : null;

      const result = await client.query(
        `INSERT INTO sessions (mentor_id, mentee_id, skill_id, session_type, date, duration, status, meeting_link, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          mentorIds[s.mentorIdx], studentIds[s.studentIdx], skillId,
          s.type, date, s.duration, s.status, meetingLink, notes,
          new Date(date.getTime() - 86400000)
        ]
      );
      if (result.rows.length > 0) {
        sessionIds.push({ id: result.rows[0].id, mentorIdx: s.mentorIdx, studentIdx: s.studentIdx, status: s.status });
      }
    }
    console.log(`Seeded ${sessionIds.length} sessions`);

    // 7. Seed ratings for completed sessions
    const reviews = [
      'Excellent explanation! Really helped me understand the concepts.',
      'Great session. Very patient and knowledgeable mentor.',
      'Learned a lot. Would definitely recommend.',
      'Very clear and structured approach to teaching.',
      'Amazing mentoring session. Helped me crack the concept!',
      'Practical and hands-on approach. Loved it.',
      'Good session, but could have been a bit longer.',
      'One of the best mentoring sessions I have had.'
    ];
    for (let i = 0; i < sessionIds.length; i++) {
      const s = sessionIds[i];
      if (s.status === 'completed') {
        const rating = 3 + Math.floor(Math.random() * 3); // 3-5
        const review = reviews[i % reviews.length];
        await client.query(
          `INSERT INTO ratings (session_id, mentor_id, mentee_id, rating, review)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (session_id, mentee_id) DO NOTHING`,
          [s.id, mentorIds[s.mentorIdx], studentIds[s.studentIdx], rating, review]
        );
      }
    }
    console.log('Seeded ratings for completed sessions');

    // 8. Seed meetings
    const meetingData = [
      {
        title: 'Introduction to Spring Boot',
        description: 'Learn the fundamentals of Spring Boot framework for building enterprise Java applications.',
        subject: 'Java',
        hostIdx: 0,
        daysAgo: 7,
        duration: 90,
        meeting_type: 'group_class',
        status: 'completed'
      },
      {
        title: 'React Hooks Deep Dive',
        description: 'Understanding useState, useEffect, useContext and custom hooks in React.',
        subject: 'React',
        hostIdx: 1,
        daysAgo: 5,
        duration: 60,
        meeting_type: 'workshop',
        status: 'completed'
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Overview of ML algorithms and hands-on with Python.',
        subject: 'Machine Learning',
        hostIdx: 2,
        daysFromNow: 2,
        duration: 120,
        meeting_type: 'group_class',
        status: 'scheduled'
      },
      {
        title: 'AWS Cloud Practitioner Prep',
        description: 'Preparing for AWS Cloud Practitioner certification.',
        subject: 'AWS',
        hostIdx: 3,
        daysFromNow: 5,
        duration: 90,
        meeting_type: 'workshop',
        status: 'scheduled'
      },
      {
        title: 'System Design Interview Mock',
        description: 'Mock system design interview session with real-world scenarios.',
        subject: 'System Design',
        hostIdx: 7,
        daysFromNow: 3,
        duration: 60,
        meeting_type: 'interview',
        status: 'scheduled'
      },
      {
        title: 'Flutter App Development Workshop',
        description: 'Building your first Flutter app from scratch.',
        subject: 'Flutter',
        hostIdx: 8,
        daysAgo: 3,
        duration: 90,
        meeting_type: 'workshop',
        status: 'completed'
      }
    ];

    const meetingIds = [];
    for (const m of meetingData) {
      const date = m.daysAgo
        ? new Date(Date.now() - m.daysAgo * 86400000)
        : new Date(Date.now() + m.daysFromNow * 86400000);
      const time = '18:00:00';
      const meetingCode = `SB${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const meetingLink = `https://meet.skillbridge.com/${meetingCode.toLowerCase()}`;
      const security = 'public';

      const result = await client.query(
        `INSERT INTO meetings (title, description, subject, host_id, meeting_code, meeting_link, date, time, duration, meeting_type, security, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (meeting_code) DO UPDATE SET status = $12
         RETURNING id`,
        [
          m.title, m.description, m.subject, mentorIds[m.hostIdx],
          meetingCode, meetingLink, date, time, m.duration,
          m.meeting_type, security, m.status
        ]
      );
      if (result.rows.length > 0) {
        meetingIds.push({ id: result.rows[0].id, hostIdx: m.hostIdx, status: m.status });

        // Add host as participant
        await client.query(
          `INSERT INTO meeting_participants (meeting_id, user_id, role)
           VALUES ($1, $2, 'host')
           ON CONFLICT (meeting_id, user_id) DO NOTHING`,
          [result.rows[0].id, mentorIds[m.hostIdx]]
        );

        // Add some students as participants
        const participantCount = 2 + Math.floor(Math.random() * 3);
        for (let p = 0; p < participantCount && p < studentIds.length; p++) {
          const studentId = studentIds[(m.hostIdx + p) % studentIds.length];
          await client.query(
            `INSERT INTO meeting_participants (meeting_id, user_id, role)
             VALUES ($1, $2, 'participant')
             ON CONFLICT (meeting_id, user_id) DO NOTHING`,
            [result.rows[0].id, studentId]
          );
        }
      }
    }
    console.log(`Seeded ${meetingIds.length} meetings`);

    // 9. Seed chat rooms and messages
    const chatData = [
      { user1Idx: 0, mentorIdx: 0 }, // Sai Krishna <-> Priya
      { user1Idx: 1, mentorIdx: 1 }, // Pavan <-> Rahul
      { user1Idx: 2, mentorIdx: 2 }, // Shreya <-> Ananya
      { user1Idx: 4, mentorIdx: 3 }, // Anjali <-> Vikram
      { user1Idx: 0, mentorIdx: 5 }, // Sai Krishna <-> Arjun
      { user1Idx: 6, mentorIdx: 5 }, // Kavitha <-> Arjun
      { user1Idx: 12, mentorIdx: 4 }, // Deepika <-> Sneha
      { user1Idx: 13, mentorIdx: 9 }, // Kiran <-> Ravi
      { user1Idx: 15, mentorIdx: 8 }, // Divya <-> Meera
      { user1Idx: 17, mentorIdx: 6 }, // Sneha <-> Deepa
      { user1Idx: 3, mentorIdx: 7 }, // Ravi <-> Karthik
      { user1Idx: 19, mentorIdx: 1 }, // Navya <-> Rahul
    ];

    const messagesByChat = [
      [
        'Hi! I need help with Java collections framework.',
        'Sure! Which part are you struggling with? HashMap, ArrayList?',
        'Yes, HashMap vs TreeMap. When to use which?',
        'HashMap is faster O(1) but unordered. TreeMap keeps keys sorted O(log n). Use TreeMap when you need sorted keys.',
        'Thanks! That makes sense now.'
      ],
      [
        'Hello, I want to learn React hooks.',
        'Great choice! Start with useState and useEffect. Have you used class components before?',
        'Yes, I have used class components. Hooks look cleaner.',
        'They are! Let me share some resources. Also, try building a small todo app.',
        'Will do! Thank you.'
      ],
      [
        'Hi Ananya, I have a question about neural networks.',
        'Of course! What specifically about neural networks?',
        'How does backpropagation work?',
        'Backpropagation computes the gradient of the loss function with respect to each weight by the chain rule, propagating errors backward through the network.',
        'Can you suggest a project to practice this?',
        'Try building an image classifier with TensorFlow. I will share a tutorial.'
      ],
      [
        'Hello! I am new to AWS. Where should I start?',
        'Welcome! Start with EC2, S3, and IAM. These are the building blocks.',
        'Any recommended resources?',
        'AWS Free Tier is perfect. Also check out the AWS Well-Architected Framework.',
        'Thanks Vikram!'
      ],
      [
        'Hi, I need help with SQL joins.',
        'Sure! Which type? INNER, LEFT, RIGHT, or FULL?',
        'LEFT JOIN and when to use it.',
        'LEFT JOIN returns all rows from the left table and matching rows from the right. Use when you want all records from the main table.',
        'Got it, thanks!'
      ],
      [
        'Arjun, can you explain database indexing?',
        'Indexing speeds up data retrieval. Think of it like a book index. B-tree indexes are most common.',
        'When should I add an index?',
        'On columns used in WHERE, JOIN, and ORDER BY clauses. But be careful, too many indexes slow down writes.',
        'Makes sense. Thanks!'
      ],
      [
        'Hi! I am working on my portfolio website.',
        'Awesome! Are you using a framework or plain HTML/CSS?',
        'I want to use Tailwind CSS.',
        'Great choice! Tailwind makes responsive design so easy. I will share a starter template.',
        'Thank you Sneha!'
      ],
      [
        'Hello, I need help with Angular routing.',
        'Sure! What is the issue?',
        'Routes are not loading properly.',
        'Check if RouterModule is imported in your app.module. Also verify your route configuration syntax.',
        'That was the issue! Thank you Ravi.'
      ],
      [
        'Hi Meera, I want to learn Flutter.',
        'Exciting! Have you done any mobile development before?',
        'No, this is my first time.',
        'Start with Dart basics, then Flutter widgets. Build a simple counter app first.',
        'Will start today. Thanks!'
      ],
      [
        'Deepa, I am concerned about cybersecurity for my project.',
        'Good thinking! What kind of project is it?',
        'A web application with user authentication.',
        'Start with input validation, use HTTPS, hash passwords with bcrypt, and implement rate limiting.',
        'Very helpful. Any tools you recommend?',
        'OWASP ZAP for testing, and SonarQube for code analysis.'
      ],
      [
        'Hi! I am interested in system design.',
        'Great topic! Have you studied any distributed systems concepts?',
        'Not yet. Where should I start?',
        'Start with CAP theorem, then learn about load balancers, caching, and database sharding.',
        'Sounds like a plan. Thanks!'
      ],
      [
        'Hi Rahul, how do I create a responsive navbar?',
        'Use Flexbox or CSS Grid. Tailwind CSS makes it very easy with responsive utilities.',
        'Can you show an example?',
        'Sure! Use "flex justify-between items-center" and "md:flex" for mobile toggle.',
        'Perfect!'
      ]
    ];

    for (let i = 0; i < chatData.length; i++) {
      const chat = chatData[i];
      const user1Id = studentIds[chat.user1Idx];
      const user2Id = mentorIds[chat.mentorIdx];
      const u1 = Math.min(user1Id, user2Id);
      const u2 = Math.max(user1Id, user2Id);

      const roomResult = await client.query(
        `INSERT INTO chat_rooms (user1_id, user2_id) VALUES ($1, $2)
         ON CONFLICT (user1_id, user2_id) DO UPDATE SET user1_id = $1
         RETURNING id`,
        [u1, u2]
      );

      if (roomResult.rows.length > 0) {
        const roomId = roomResult.rows[0].id;
        const messages = messagesByChat[i] || messagesByChat[0];

        for (let j = 0; j < messages.length; j++) {
          const senderId = j % 2 === 0 ? user1Id : user2Id;
          const createdAt = new Date(Date.now() - (messages.length - j) * 3600000);
          await client.query(
            `INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT DO NOTHING`,
            [senderId, senderId === user1Id ? user2Id : user1Id, messages[j], j < messages.length - 1, createdAt]
          );
        }
      }
    }
    console.log('Seeded chat rooms and messages');

    // 10. Seed notifications
    const notificationData = [
      // session_booking notifications
      { userIdx: 0, type: 'session_booking', title: 'Session Booked', message: 'Your session on Java with Priya Sharma has been booked.', daysAgo: 30 },
      { userIdx: 1, type: 'session_booking', title: 'Session Booked', message: 'Your session on React with Rahul Reddy has been booked.', daysAgo: 25 },
      { userIdx: 2, type: 'session_booking', title: 'Session Booked', message: 'Your session on Machine Learning with Ananya Patel has been booked.', daysAgo: 20 },
      // session_approved notifications
      { userIdx: 3, type: 'session_approved', title: 'Session Approved', message: 'Your Python learning session with Ananya Patel has been approved.', daysAgo: 2 },
      { userIdx: 17, type: 'session_approved', title: 'Session Approved', message: 'Your Docker session with Vikram Singh has been approved.', daysAgo: 1 },
      // session_completed notifications
      { userIdx: 0, type: 'session_completed', title: 'Session Completed', message: 'Your Java session with Priya Sharma is completed. Please rate it.', daysAgo: 29 },
      { userIdx: 1, type: 'session_completed', title: 'Session Completed', message: 'Your React session with Rahul Reddy is completed.', daysAgo: 24 },
      { userIdx: 2, type: 'session_completed', title: 'Session Completed', message: 'Your ML session with Ananya Patel is completed.', daysAgo: 19 },
      { userIdx: 6, type: 'session_completed', title: 'Session Completed', message: 'Your SQL session with Arjun Kumar is completed.', daysAgo: 17 },
      // new_message notifications
      { userIdx: 0, type: 'new_message', title: 'New Message', message: 'You have a new message from Priya Sharma.', daysAgo: 5 },
      { userIdx: 1, type: 'new_message', title: 'New Message', message: 'You have a new message from Rahul Reddy.', daysAgo: 4 },
      { userIdx: 2, type: 'new_message', title: 'New Message', message: 'You have a new message from Ananya Patel.', daysAgo: 3 },
      { userIdx: 4, type: 'new_message', title: 'New Message', message: 'You have a new message from Vikram Singh.', daysAgo: 2 },
      // application_approved notifications
      { userIdx: 100, type: 'application_approved', title: 'Application Approved', message: 'Your mentor application has been approved by the admin.', daysAgo: 60 },
      { userIdx: 101, type: 'application_approved', title: 'Application Approved', message: 'Your developer application has been approved.', daysAgo: 55 },
      // session_reminder notifications
      { userIdx: 5, type: 'session_reminder', title: 'Session Reminder', message: 'You have an upcoming interview prep session in 3 days.', daysFromNow: 1 },
      { userIdx: 8, type: 'session_reminder', title: 'Session Reminder', message: 'System Design session with Karthik Iyer is coming up.', daysFromNow: 2 },
      // general notifications
      { userIdx: 0, type: 'general', title: 'Welcome to SkillBridge!', message: 'Welcome to the platform. Start exploring mentors and sessions.', daysAgo: 60 },
      { userIdx: 1, type: 'general', title: 'Welcome to SkillBridge!', message: 'Your account is set up. Book your first session!', daysAgo: 50 },
      { userIdx: 2, type: 'general', title: 'New Feature', message: 'Video calls are now available. Try it in your next session!', daysAgo: 10 },
      { userIdx: 3, type: 'general', title: 'Tip of the Day', message: 'Complete your profile to get better mentor matches.', daysAgo: 8 },
      { userIdx: 4, type: 'general', title: 'Tip of the Day', message: 'Rate your sessions to help other students find the best mentors.', daysAgo: 6 },
    ];

    let notificationCount = 0;
    for (const n of notificationData) {
      const userId = n.userIdx < studentIds.length ? studentIds[n.userIdx] : null;
      if (!userId && n.userIdx >= 100) {
        // Use dev or mentor id
        const idx = n.userIdx - 100;
        if (idx < devIds.length) {
          await client.query(
            `INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [devIds[idx], n.type, n.title, n.message, Math.random() > 0.5, new Date(Date.now() - (n.daysAgo || 0) * 86400000)]
          );
          notificationCount++;
        }
        continue;
      }
      if (userId) {
        const createdAt = n.daysFromNow
          ? new Date(Date.now() + n.daysFromNow * 86400000)
          : new Date(Date.now() - (n.daysAgo || 0) * 86400000);
        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [userId, n.type, n.title, n.message, Math.random() > 0.5, createdAt]
        );
        notificationCount++;
      }
    }
    console.log(`Seeded ${notificationCount} notifications`);

    // 11. Seed learning progress
    const learningProgressData = [
      { studentIdx: 0, skill: 'Java', sessions: 3, streak: 2 },
      { studentIdx: 0, skill: 'Data Structures', sessions: 2, streak: 1 },
      { studentIdx: 1, skill: 'React', sessions: 4, streak: 3 },
      { studentIdx: 2, skill: 'Machine Learning', sessions: 5, streak: 4 },
      { studentIdx: 2, skill: 'Python', sessions: 3, streak: 2 },
      { studentIdx: 4, skill: 'AWS', sessions: 2, streak: 1 },
      { studentIdx: 6, skill: 'SQL', sessions: 3, streak: 2 },
      { studentIdx: 8, skill: 'React', sessions: 2, streak: 1 },
      { studentIdx: 12, skill: 'UI UX', sessions: 2, streak: 1 },
      { studentIdx: 15, skill: 'Flutter', sessions: 3, streak: 2 }
    ];

    let progressCount = 0;
    for (const lp of learningProgressData) {
      const skillId = skillMap[lp.skill];
      if (skillId) {
        const lastSession = new Date(Date.now() - lp.streak * 86400000);
        await client.query(
          `INSERT INTO learning_progress (user_id, skill_id, sessions_completed, last_session_date, streak)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id, skill_id) DO UPDATE SET
             sessions_completed = GREATEST(learning_progress.sessions_completed, $3),
             streak = GREATEST(learning_progress.streak, $5),
             last_session_date = GREATEST(learning_progress.last_session_date, $4)`,
          [studentIds[lp.studentIdx], skillId, lp.sessions, lastSession, lp.streak]
        );
        progressCount++;
      }
    }
    console.log(`Seeded ${progressCount} learning progress entries`);

    await client.query('COMMIT');

    // Summary
    const summary = `Seed completed successfully:
  - ${adminUsers.length} admin accounts
  - ${mentors.length} mentor accounts
  - ${developers.length} developer accounts
  - ${students.length} student accounts
  - ${sessionIds.length} sessions
  - ${meetingIds.length} meetings
  - ${chatData.length} chat rooms with messages
  - ${notificationCount} notifications
  - ${progressCount} learning progress entries
  - ${skills.length} skills
  Passwords: Admin=${ADMIN_PASSWORD}, Demo Users=${DEMO_PASSWORD}`;

    console.log(summary);
    return summary;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;
