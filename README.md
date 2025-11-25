# Selego – Intern Technical Test

**⏱ Time Allocation: 3 hours maximum**

---

## The Problem

You're building a **project budget tracker**. Companies need to track their projects, expenses, and know when they're about to go over budget.

**Your job:** Build a minimal working version that lets users:

1. Create and manage projects with budgets
2. Add expenses to projects
3. See if they're staying within budget

**What we're testing:**

- Can you design a good data model?
- Can you build clean APIs?
- Can you integrate with external services (email / AI)?
- Can you structure service layers properly?
- Can you ship something that works, fast?
- Do you keep it simple or over-engineer?
- Can you develop a good looking UI and have a simple/understandable UX.

---

## Stack

- **Frontend:** React (already set up in `app/` folder)
- **Backend:** Node.js + Express (already set up in `api/` folder)
- **Database:** MongoDB (with Mongoose)

**Note:** The repository includes a working boilerplate with authentication and basic infrastructure. You should build your features on top of this existing codebase.

---

## What's Already Built

The boilerplate includes:

✅ **Backend (`api/` folder)**

- User authentication (signup, signin, logout)
- User model with MongoDB
- File upload to S3
- Email service integration (Brevo)
- Basic API structure

✅ **Frontend (`app/` folder)**

- React application with routing
- Authentication pages (signup, signin)
- API client service
- Basic components (TopBar, NavBar)
- File upload component

## What to Build

You need to add the project budget tracker features on top of this foundation.

### 1. Core features

Build a React interface and the according API routes where users can:

- View all projects and their budget status
- Create new projects
- Add/See expenses to projects
- See when a project is over budget
- Delete things if needed

Optional :
- Add users to a project
- View all the users in the project

**We're not providing wireframes or detailed specs.** Use your judgment on:

- What data to display
- How to organize the UI
- What actions users need
- How to show budget alerts
- What the persons using the app would need so that it's useful for them. Don't hesitate to take some freedom regarding the required features so that it's the more useful/usable possible for the user.

---

### 2. AI Bonus (optional, 30 min max)

If you have time, add a **mini AI feature**:

**Examples:**

- Automatically categorize an expense (marketing, tech, HR, etc.)
- Generate a personalized alert message: _"You're 20% over budget on marketing"_
- Suggestion: _"Your 'Facebook Ads' expense seems to be marketing"_

You can use:

- [OpenRouter](https://openrouter.ai/models?q=free) (lots of different free models)
- [OpenAI API](https://platform.openai.com/)
- [Anthropic Claude](https://www.anthropic.com/)
- Or any other simple service

⚠️ **Optional**: don't spend more than 30 minutes on it. We prefer a clean CRUD over a poorly integrated AI.

### 3. Email Notification Feature Bonus (optional)

**When a project goes over budget**, send an automatic email notification using Brevo.

#### Implementation Details:

The boilerplate already includes: Brevo service integration in `api/src/services/brevo.js`

You need to:

1. **Set up your Brevo account** (free tier available at [brevo.com](https://www.brevo.com/))
2. **Add your API key** to `api/.env`:
   ```
   BREVO_KEY=your_brevo_api_key_here
   ```
3. **Create the logic** to detect when a project goes over budget
4. **Send the email** when this happens

---

## Technical Constraints

### Follow These Principles

Based on our [coding standards](https://github.com/selego/new-technical-test/blob/main/whitepaper.md):

1. **Early Returns** - Use early returns in functions for better readability

   ```javascript
   // ✅ Good
   const { data, ok } = await api.get("/project/123");
   if (!ok) return console.error("Failed to fetch");
   setProject(data);

   // ❌ Bad
   const { data, ok } = await api.get("/project/123");
   if (ok) {
     setProject(data);
   }
   ```

2. **Keep It Simple (KIS)** - Avoid over-abstraction. Be explicit and clear.

   ```javascript
   // ✅ Good - explicit and clear
   <div className="project-list">
     <ProjectCard project={project1} />
     <ProjectCard project={project2} />
     <ProjectCard project={project3} />
   </div>;

   // ❌ Bad - unnecessary abstraction for 3 items
   {
     projects.map((project) => (
       <ProjectCard key={project._id} project={project} />
     ));
   }
   ```

3. **Flat Data Structures** - Avoid nested objects in MongoDB schemas

   ```javascript
   // ✅ Good
   const expenseSchema = {
     projectId: String,
     amount: Number,
     category: String,
   };

   // ❌ Bad
   const projectSchema = {
     expenses: [{ amount: Number, category: String }], // Nested!
   };
   ```

4. **Consistent API Responses** - Always return `{ ok, data }` or `{ ok, error }`

   ```javascript
   // ✅ Good
   return res.status(200).json({ ok: true, data: project });

   // ❌ Bad
   return res.status(200).json(project);
   ```

5. **One Route, One Responsibility** - POST routes create ONE type of object

   ```javascript
   // ✅ Good
   POST /api/project        - Creates a project
   POST /api/expense        - Creates an expense

   // ❌ Bad
   POST /api/project        - Creates project AND its expenses
   ```

If you want to understand better our coding standards you can check the whitepaper.md

## Evaluation Criteria

We will evaluate your submission based on:

### 1. Code Quality (40%)

- **Simplicity**: Is the code easy to understand?
- **Readability**: Proper naming, structure, and formatting
- **Consistency**: Following patterns throughout
- **Early returns**: Using them appropriately
- **No over-engineering**: Avoiding unnecessary abstractions

### 2. Architecture & Design (30%)

- **MongoDB schema**: Flat structures, proper relationships
- **API design**: RESTful conventions, consistent naming
- **Error handling**: Graceful failures, proper status codes
- **Data flow**: Clean separation of concerns

### 3. Functionality (20%)

- **Does it work?**: Can we run it and test the features?
- **Completeness**: Are core features implemented?

### 4. Speed & Pragmatism (10%)

- **Time management**: Did you deliver in 2-3 hours?
- **Priorities**: Did you focus on what matters?
- **Working over perfect**: Is it functional vs. over-polished?

---

## Submission Guidelines

### What to Submit

**GitHub Repository** (public or private with access to us)

Your README should include:

- How to set it up and run it
- Any API keys we need (please send the .env with the keys when you send it to us)
- Decisions you made and why
- Time you spent
- What you'd do differently with more time

**Make it runnable:**

- We should be able to `npm install` and run your code in both `api/` and `app/` folders
- Include your `.env` files with all necessary API keys
- Update the `MONGODB_ENDPOINT` in `api/.env` with your personal database name (format: `yourname-ddmmyyyy`). Please keep the same MONGODB_URL, just edit the end (database), to create your own database on the existing url (i.e replace hugo24112025 by your info).
- Document any additional setup steps needed

### What We're Looking For

**Red Flags 🚩:**

- Over-complicated solutions with unnecessary abstractions
- Nested data structures in MongoDB (expenses inside projects)
- Inconsistent patterns and naming across the codebase
- No error handling for external services (email/AI)
- Code that doesn't run or missing core features
- Over-engineered AI features that don't add real value

**Green Flags ✅:**

- Clean, readable code that's easy to understand
- Flat MongoDB schemas with proper references
- Well-structured service layer (separate files for email/AI)
- Consistent API patterns throughout
- Early returns and simple logic
- Working features with good error handling for external APIs
- Good judgment on what to build vs skip
- Simple, practical AI feature that adds value
- Smart trade-offs between speed and quality

---

## Frequently Asked Questions

**Q: How much detail do I need in the data models?**  
A: Use your judgment. Include what makes sense for a budget tracker. We're evaluating your decisions.

**Q: Which email service should I use?**  
A: The boilerplate already has Brevo configured, you just need to setup a free account and put your keys. You can use the existing email service integration or switch to another provider if you prefer.

**Q: When should the email alert be sent?**  
A: You decide. When expenses are added? On a schedule? When budget is exceeded? Justify your choice in the README.

**Q: Which AI feature should I build?**  
A: Pick the one that makes most sense to you or come up with your own. We want to see your judgment. Don't overthink it - simple and working beats complex and broken.

**Q: Do I need to handle AI errors gracefully?**  
A: Yes. APIs fail. Show us how you handle it when the AI service is down or returns an error.

**Q: Can I use a different AI service?**  
A: Absolutely. Use whatever you're comfortable with. We care about the integration pattern, not the specific service.

**Q: Do I need to build authentication?**  
A: No, authentication is already implemented in the boilerplate. You can use the existing user system or skip authentication entirely for the project tracker features.

**Q: What about styling?**  
A: Make it usable. We're not judging design skills, but it should be functional and looking at least okay!

**Q: What if I can't finish in 3 hours?**  
A: Submit what you have. A working partial solution is better than a broken complete one. Be honest about time spent.

**Q: Can I use TypeScript?**  
A: We prefer plain JavaScript.

**Q: Should I use state management libraries?**  
A: Use your judgment. For a small app, local state is probably fine. Otherwise, we usually use zustand, as done with the user.

---

## Getting Started

### Setup Instructions

1. **Clone and create your own repository**

   ```bash
   git clone <repository-url>
   cd technical-test-new
   ```

   - Create a new repository on your GitHub account
   - Push your code to your own repository

2. **Use the existing boilerplate**

   - The repository already contains a working `api/` (backend) and `app/` (frontend) folder
   - Authentication system with signup/signin is already implemented
   - Basic infrastructure (routing, API client, file upload) is already set up
   - User model exists - you need to create Project and Expense models
   - Focus on building the project tracker features on top of this foundation

3. **Configure your database**

   - Create your own MongoDB database by changing the database name at the end of the MongoDB URL
   - In the `api/.env` file, update the `MONGODB_ENDPOINT`:

   ```
   MONGODB_ENDPOINT=mongodb+srv://user:password@cluster.mongodb.net/yourname-24112025
   ```

   - Replace `yourname-24112025` with your name and today's date (e.g., `hugo-24112025`)
   - Keep the existing user and password, just edit the end by your name and date.
   - This ensures everyone has their own isolated database

4. **Install dependencies**

   ```bash
   cd api && npm install
   cd ../app && npm install
   ```

5. **Start development**

   ```bash
   # Terminal 1 - Backend (runs on http://localhost:8080)
   cd api && npm run dev

   # Terminal 2 - Frontend (runs on http://localhost:3000)
   cd app && npm run dev
   ```

   - Backend API: `http://localhost:8080`
   - Frontend: `http://localhost:3000`

### Development Steps

1. **Design your MongoDB schemas** (think flat!)
2. **Build the backend API**
3. **Integrate services** (email + AI - keep them simple and modular)
4. **Build the frontend** (connect to your API)
5. **Test everything works** (create project, add expenses, trigger email, use AI)
6. **Clean up and document**
7. **Submit**

---

## Final Notes

We're looking for developers who:

- **Think clearly** about data and architecture
- **Write simple, maintainable code**
- **Ship working features** quickly
- **Make smart trade-offs** under time pressure
- **Follow conventions** and principles

Good luck! We're excited to see what you build. 🚀

---

**Questions?** Email the person who sent you this technical test

**Time starts when you clone this repository.**
