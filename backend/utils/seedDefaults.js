const Course = require('../models/Course');

const defaultCourses = [
  {
    name: 'B.A.',
    duration: '3 Years Degree Course',
    eligibility: '10+2 or equivalent examination from a recognized board',
    description: 'Bachelor of Arts degree program offering comprehensive humanities and social sciences education.',
    sqlite_id: 1
  },
  {
    name: 'B.A. Honours',
    duration: '3 Years Degree Course',
    eligibility: '10+2 or equivalent with minimum required percentage in relevant subject',
    description: 'Specialized Bachelor of Arts Honours degree program with in-depth focus on major subject.',
    sqlite_id: 2
  },
  {
    name: 'B.Sc.',
    duration: '3 Years Degree Course',
    eligibility: '10+2 Science (PCM/PCB) from a recognized board',
    description: 'Bachelor of Science degree program focusing on physical, chemical, and biological sciences.',
    sqlite_id: 3
  },
  {
    name: 'B.Sc. Honours',
    duration: '3 Years Degree Course',
    eligibility: '10+2 Science with qualifying marks in major discipline',
    description: 'Specialized Bachelor of Science Honours degree program with advanced laboratory and theoretical coursework.',
    sqlite_id: 4
  },
  {
    name: 'B.Com',
    duration: '3 Years Degree Course',
    eligibility: '10+2 Commerce or equivalent from a recognized board',
    description: 'Bachelor of Commerce degree program covering accounting, finance, business administration, and economics.',
    sqlite_id: 5
  },
  {
    name: 'B.Com Honours',
    duration: '3 Years Degree Course',
    eligibility: '10+2 Commerce with qualifying aggregate marks',
    description: 'Specialized Bachelor of Commerce Honours degree program for advanced financial and business studies.',
    sqlite_id: 6
  }
];

/**
 * Manual-only course catalog initializer.
 * Does NOT auto-create default admin credentials, unverified notices, or local-only gallery paths,
 * and never overwrites existing migrated records.
 */
const seedCoursesIfEmpty = async () => {
  const courseCount = await Course.countDocuments();
  if (courseCount === 0) {
    await Course.insertMany(defaultCourses);
    console.log('Seeded default degree courses into empty courses collection.');
  } else {
    console.log(`Skipped seeding: ${courseCount} courses already exist.`);
  }
};

module.exports = seedCoursesIfEmpty;
