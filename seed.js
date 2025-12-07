const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import all models
const User = require("./models/User");
const Profile = require("./models/Profile");
const Category = require("./models/Category");
const Course = require("./models/Course");
const Section = require("./models/Section");
const SubSection = require("./models/SubSection");
const RatingAndReview = require("./models/RatingAndReview");
const CourseProgress = require("./models/CourseProgress");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ DB Connected Successfully"))
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1);
  });

// Seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Category.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await SubSection.deleteMany({});
    await RatingAndReview.deleteMany({});
    await CourseProgress.deleteMany({});
    console.log("🗑️  Cleared existing data\n");

    // ========================================
    // 1. CREATE CATEGORIES
    // ========================================
    console.log("📂 Creating Categories...");
    const categories = await Category.insertMany([
      {
        name: "Web Development",
        description:
          "Learn modern web development with React, Node.js, and more",
      },
      {
        name: "Data Science",
        description: "Master data analysis, machine learning, and AI",
      },
      {
        name: "Mobile Development",
        description: "Build iOS and Android apps with React Native and Flutter",
      },
      {
        name: "Cloud Computing",
        description: "Learn AWS, Azure, and Google Cloud Platform",
      },
      {
        name: "DevOps",
        description: "Master CI/CD, Docker, Kubernetes, and automation",
      },
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // ========================================
    // 2. CREATE PROFILES & USERS
    // ========================================
    console.log("👥 Creating Users...");

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("Test@123", 10);

    // Student 1
    const studentProfile1 = await Profile.create({
      gender: "Male",
      dateOfBirth: "1995-05-15",
      about: "Passionate learner interested in web development",
      contactNumber: 9876543210,
    });

    const student1 = await User.create({
      firstName: "Rahul",
      lastName: "Kumar",
      email: "student@test.com",
      password: hashedPassword,
      accountType: "Student",
      additionalDetails: studentProfile1._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Rahul Kumar",
    });

    // Student 2
    const studentProfile2 = await Profile.create({
      gender: "Female",
      dateOfBirth: "1998-08-20",
      about: "Tech enthusiast exploring data science",
      contactNumber: 9876543211,
    });

    const student2 = await User.create({
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya@test.com",
      password: hashedPassword,
      accountType: "Student",
      additionalDetails: studentProfile2._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Priya Sharma",
    });

    // Student 3
    const studentProfile3 = await Profile.create({
      gender: "Male",
      dateOfBirth: "1997-03-10",
      about: "Aspiring mobile app developer",
      contactNumber: 9876543212,
    });

    const student3 = await User.create({
      firstName: "Arjun",
      lastName: "Singh",
      email: "arjun@test.com",
      password: hashedPassword,
      accountType: "Student",
      additionalDetails: studentProfile3._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Arjun Singh",
    });

    // Instructor 1
    const instructorProfile1 = await Profile.create({
      gender: "Male",
      dateOfBirth: "1985-12-05",
      about:
        "10+ years experience in full-stack development. Taught 50,000+ students",
      contactNumber: 9123456789,
    });

    const instructor1 = await User.create({
      firstName: "Amit",
      lastName: "Patel",
      email: "instructor@test.com",
      password: hashedPassword,
      accountType: "Instructor",
      additionalDetails: instructorProfile1._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Amit Patel",
    });

    // Instructor 2
    const instructorProfile2 = await Profile.create({
      gender: "Female",
      dateOfBirth: "1988-07-18",
      about: "Data Science expert and ML engineer with PhD from IIT",
      contactNumber: 9123456790,
    });

    const instructor2 = await User.create({
      firstName: "Sneha",
      lastName: "Reddy",
      email: "sneha@test.com",
      password: hashedPassword,
      accountType: "Instructor",
      additionalDetails: instructorProfile2._id,
      image: "https://api.dicebear.com/5.x/initials/svg?seed=Sneha Reddy",
    });

    console.log(`✅ Created ${5} users (3 students + 2 instructors)\n`);

    // ========================================
    // 3. CREATE COURSES WITH SECTIONS & SUBSECTIONS
    // ========================================
    console.log("📚 Creating Courses...");

    // Course 1: Complete Web Development Bootcamp
    const subsections1_1 = await SubSection.insertMany([
      {
        title: "Introduction to HTML",
        timeDuration: "15:30",
        description: "Learn HTML basics and structure",
        videoUrl: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
      },
      {
        title: "HTML Forms and Input",
        timeDuration: "20:45",
        description: "Master HTML forms and user input",
        videoUrl: "https://www.youtube.com/watch?v=fNcJuPIZ2WE",
      },
    ]);

    const section1_1 = await Section.create({
      sectionName: "HTML Fundamentals",
      subSection: subsections1_1.map((sub) => sub._id),
    });

    const subsections1_2 = await SubSection.insertMany([
      {
        title: "CSS Basics",
        timeDuration: "18:20",
        description: "Introduction to CSS styling",
        videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40",
      },
      {
        title: "Flexbox and Grid",
        timeDuration: "25:10",
        description: "Modern CSS layouts with Flexbox and Grid",
        videoUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
      },
    ]);

    const section1_2 = await Section.create({
      sectionName: "CSS Mastery",
      subSection: subsections1_2.map((sub) => sub._id),
    });

    const course1 = await Course.create({
      courseName: "Complete Web Development Bootcamp 2024",
      courseDescription:
        "Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and become a full-stack developer.",
      instructor: instructor1._id,
      whatYouWillLearn:
        "Build responsive websites, Create full-stack applications, Master React and Node.js, Deploy projects to production",
      courseContent: [section1_1._id, section1_2._id],
      price: 4999,
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      tag: ["Web Development", "React", "Node.js", "JavaScript"],
      category: categories[0]._id,
      studentsEnroled: [student1._id, student2._id],
      instructions: [
        "Basic computer knowledge required",
        "No prior coding experience needed",
        "Dedication to practice 2-3 hours daily",
      ],
      status: "Published",
    });

    // Course 2: Data Science with Python
    const subsections2_1 = await SubSection.insertMany([
      {
        title: "Python Basics",
        timeDuration: "22:15",
        description: "Introduction to Python programming",
        videoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      },
      {
        title: "Data Types and Structures",
        timeDuration: "28:30",
        description: "Learn Python data types and structures",
        videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
      },
    ]);

    const section2_1 = await Section.create({
      sectionName: "Python Fundamentals",
      subSection: subsections2_1.map((sub) => sub._id),
    });

    const subsections2_2 = await SubSection.insertMany([
      {
        title: "Introduction to NumPy",
        timeDuration: "19:45",
        description: "Learn NumPy for numerical computing",
        videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
      },
      {
        title: "Data Analysis with Pandas",
        timeDuration: "32:20",
        description: "Master Pandas for data manipulation",
        videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
      },
    ]);

    const section2_2 = await Section.create({
      sectionName: "Data Science Libraries",
      subSection: subsections2_2.map((sub) => sub._id),
    });

    const course2 = await Course.create({
      courseName: "Data Science Complete Course with Python",
      courseDescription:
        "Become a Data Scientist! Learn Python, NumPy, Pandas, Matplotlib, Machine Learning, and more. Work on real data science projects.",
      instructor: instructor2._id,
      whatYouWillLearn:
        "Python programming, Data analysis with Pandas, Machine Learning basics, Data visualization, Build ML models",
      courseContent: [section2_1._id, section2_2._id],
      price: 5999,
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      tag: ["Data Science", "Python", "Machine Learning", "Analytics"],
      category: categories[1]._id,
      studentsEnroled: [student1._id, student3._id],
      instructions: [
        "Basic mathematics knowledge helpful",
        "Computer with 4GB RAM minimum",
        "Curiosity to learn data science",
      ],
      status: "Published",
    });

    // Course 3: React Native Mobile Development
    const subsections3_1 = await SubSection.insertMany([
      {
        title: "React Native Setup",
        timeDuration: "16:40",
        description: "Setup React Native development environment",
        videoUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc",
      },
      {
        title: "Building First App",
        timeDuration: "24:55",
        description: "Create your first mobile app",
        videoUrl: "https://www.youtube.com/watch?v=ur6I5m2nTvk",
      },
    ]);

    const section3_1 = await Section.create({
      sectionName: "Getting Started with React Native",
      subSection: subsections3_1.map((sub) => sub._id),
    });

    const course3 = await Course.create({
      courseName: "React Native - Build Mobile Apps",
      courseDescription:
        "Learn React Native and build iOS and Android apps with JavaScript. Create stunning mobile applications.",
      instructor: instructor1._id,
      whatYouWillLearn:
        "Build cross-platform apps, Master React Native, Create beautiful UIs, Deploy to app stores",
      courseContent: [section3_1._id],
      price: 4499,
      thumbnail:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
      tag: ["Mobile Development", "React Native", "iOS", "Android"],
      category: categories[2]._id,
      studentsEnroled: [student3._id],
      instructions: [
        "JavaScript knowledge required",
        "React basics helpful but not required",
        "Mac for iOS development (optional)",
      ],
      status: "Published",
    });

    // Course 4: AWS Cloud Practitioner
    const course4 = await Course.create({
      courseName: "AWS Cloud Practitioner Certification",
      courseDescription:
        "Prepare for AWS Cloud Practitioner certification. Learn cloud computing fundamentals and AWS services.",
      instructor: instructor1._id,
      whatYouWillLearn:
        "AWS fundamentals, Cloud computing basics, EC2, S3, RDS services, Pass certification exam",
      courseContent: [],
      price: 3999,
      thumbnail:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      tag: ["Cloud Computing", "AWS", "Certification"],
      category: categories[3]._id,
      studentsEnroled: [],
      instructions: [
        "Basic IT knowledge helpful",
        "No prior cloud experience needed",
        "AWS free tier account (covered in course)",
      ],
      status: "Published",
    });

    // Course 5: DevOps Masterclass
    const course5 = await Course.create({
      courseName: "DevOps Complete Masterclass",
      courseDescription:
        "Master DevOps tools and practices. Learn Docker, Kubernetes, Jenkins, CI/CD, and automation.",
      instructor: instructor2._id,
      whatYouWillLearn:
        "Docker containerization, Kubernetes orchestration, CI/CD pipelines, Infrastructure as Code, Automation tools",
      courseContent: [],
      price: 6999,
      thumbnail:
        "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800",
      tag: ["DevOps", "Docker", "Kubernetes", "CI/CD"],
      category: categories[4]._id,
      studentsEnroled: [student2._id],
      instructions: [
        "Linux basics required",
        "Programming experience helpful",
        "Dedicated learning time needed",
      ],
      status: "Published",
    });

    console.log(`✅ Created 5 courses with sections and subsections\n`);

    // ========================================
    // 4. UPDATE CATEGORIES WITH COURSES
    // ========================================
    console.log("🔗 Linking courses to categories...");
    await Category.findByIdAndUpdate(categories[0]._id, {
      $push: { courses: { $each: [course1._id, course3._id] } },
    });
    await Category.findByIdAndUpdate(categories[1]._id, {
      $push: { courses: course2._id },
    });
    await Category.findByIdAndUpdate(categories[2]._id, {
      $push: { courses: course3._id },
    });
    await Category.findByIdAndUpdate(categories[3]._id, {
      $push: { courses: course4._id },
    });
    await Category.findByIdAndUpdate(categories[4]._id, {
      $push: { courses: course5._id },
    });
    console.log("✅ Categories updated with courses\n");

    // ========================================
    // 5. UPDATE USERS WITH ENROLLED COURSES
    // ========================================
    console.log("📝 Updating user enrollments...");
    await User.findByIdAndUpdate(student1._id, {
      $push: { courses: { $each: [course1._id, course2._id] } },
    });
    await User.findByIdAndUpdate(student2._id, {
      $push: { courses: { $each: [course1._id, course5._id] } },
    });
    await User.findByIdAndUpdate(student3._id, {
      $push: { courses: { $each: [course2._id, course3._id] } },
    });
    await User.findByIdAndUpdate(instructor1._id, {
      $push: { courses: { $each: [course1._id, course3._id, course4._id] } },
    });
    await User.findByIdAndUpdate(instructor2._id, {
      $push: { courses: { $each: [course2._id, course5._id] } },
    });
    console.log("✅ User enrollments updated\n");

    // ========================================
    // 6. CREATE RATINGS AND REVIEWS
    // ========================================
    console.log("⭐ Creating ratings and reviews...");
    const review1 = await RatingAndReview.create({
      user: student1._id,
      rating: 5,
      review:
        "Excellent course! The instructor explains everything clearly. Highly recommended for beginners.",
      course: course1._id,
    });

    const review2 = await RatingAndReview.create({
      user: student2._id,
      rating: 4,
      review:
        "Great content and well-structured. Would love to see more advanced topics.",
      course: course1._id,
    });

    const review3 = await RatingAndReview.create({
      user: student1._id,
      rating: 5,
      review:
        "Best data science course I've taken. Practical examples and real-world projects.",
      course: course2._id,
    });

    const review4 = await RatingAndReview.create({
      user: student3._id,
      rating: 4,
      review:
        "Good introduction to React Native. Helped me build my first app!",
      course: course3._id,
    });

    const review5 = await RatingAndReview.create({
      user: student2._id,
      rating: 5,
      review:
        "Comprehensive DevOps course. Covers all essential tools and practices.",
      course: course5._id,
    });

    // Update courses with reviews
    await Course.findByIdAndUpdate(course1._id, {
      $push: { ratingAndReviews: { $each: [review1._id, review2._id] } },
    });
    await Course.findByIdAndUpdate(course2._id, {
      $push: { ratingAndReviews: review3._id },
    });
    await Course.findByIdAndUpdate(course3._id, {
      $push: { ratingAndReviews: review4._id },
    });
    await Course.findByIdAndUpdate(course5._id, {
      $push: { ratingAndReviews: review5._id },
    });

    console.log(`✅ Created 5 ratings and reviews\n`);

    // ========================================
    // 7. CREATE COURSE PROGRESS
    // ========================================
    console.log("📊 Creating course progress...");
    await CourseProgress.create({
      courseID: course1._id,
      userId: student1._id,
      completedVideos: [subsections1_1[0]._id, subsections1_1[1]._id],
    });

    await CourseProgress.create({
      courseID: course2._id,
      userId: student1._id,
      completedVideos: [subsections2_1[0]._id],
    });

    await CourseProgress.create({
      courseID: course1._id,
      userId: student2._id,
      completedVideos: [subsections1_1[0]._id],
    });

    console.log("✅ Course progress created\n");

    // ========================================
    // SUMMARY
    // ========================================
    console.log("🎉 DATABASE SEEDING COMPLETED! 🎉\n");
    console.log("=".repeat(50));
    console.log("📊 Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Categories: 5`);
    console.log(`✅ Users: 5 (3 Students + 2 Instructors)`);
    console.log(`✅ Courses: 5`);
    console.log(`✅ Sections: 3`);
    console.log(`✅ SubSections: 6`);
    console.log(`✅ Reviews: 5`);
    console.log(`✅ Course Progress: 3`);
    console.log("=".repeat(50));
    console.log("\n📧 Test Accounts:");
    console.log("=".repeat(50));
    console.log("Student: student@test.com / Test@123");
    console.log("Instructor: instructor@test.com / Test@123");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
