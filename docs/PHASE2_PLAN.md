# Phase 2: Concept Tracking & Tagging - Implementation Plan

## Overview

Phase 2 builds the foundation for personalized, adaptive learning by tracking which mathematical concepts students have mastered and which need more work. This enables future phases (spaced repetition, adaptive problem selection) to provide truly personalized learning experiences.

## Problem Addressed

- **No Progress Tracking**: System doesn't know what students have mastered
- **No Personalization**: All students get same problems regardless of level
- **No Concept Mapping**: Problems not tagged with underlying concepts

## Solution

Comprehensive concept tracking system that monitors mastery levels, tags problems with concepts, and maintains individual student progress profiles.

---

## Phase 2 Components

### 2.1 Concept Taxonomy System

**Objective:** Define the complete hierarchy of mathematical concepts from elementary to advanced.

**Implementation:**
- Create concept taxonomy database (JSON/YAML structure)
- Define parent-child relationships (e.g., "Linear Equations" → "Algebra" → "Mathematics")
- Specify prerequisites (e.g., "Quadratic Equations" requires "Linear Equations")
- Tag difficulty levels (elementary, middle, high, college)

**Deliverables:**
```typescript
// app/data/concepts.ts
interface Concept {
  id: string
  name: string
  description: string
  parentId: string | null
  prerequisites: string[]
  difficulty: 'elementary' | 'middle' | 'high' | 'college'
  tags: string[]
}

// Example: Linear Equations concept
{
  id: 'linear-equations-1var',
  name: 'Linear Equations (1 Variable)',
  description: 'Solving equations of the form ax + b = c',
  parentId: 'algebra-basics',
  prerequisites: ['basic-arithmetic', 'variables'],
  difficulty: 'middle',
  tags: ['algebra', 'equations', 'solving']
}
```

**Technical Approach:**
1. Research standard math curriculum (Common Core, etc.)
2. Create hierarchical concept tree
3. Define 50-100 core concepts covering K-12 math
4. Implement concept lookup and relationship queries
5. Create concept validation utilities

**Success Criteria:**
- ✅ 50+ concepts defined with clear hierarchy
- ✅ Prerequisites mapped for each concept
- ✅ Concepts queryable by level, parent, prerequisites
- ✅ Taxonomy validated against standard curriculum

---

### 2.2 Mastery Tracking System

**Objective:** Track individual student mastery levels for each concept over time.

**Implementation:**
- Store mastery levels per student per concept (0-100%)
- Track attempts, successes, failures per concept
- Calculate mastery based on recent performance
- Implement mastery decay (knowledge fades over time)

**Deliverables:**
```typescript
// app/types/mastery.ts
interface ConceptMastery {
  studentId: string
  conceptId: string
  masteryLevel: number // 0-100
  attempts: number
  successes: number
  failures: number
  lastPracticed: Date
  firstAttempt: Date
  decayRate: number
  confidenceInterval: number
}

// app/utils/mastery.ts
export function calculateMastery(history: AttemptHistory[]): number
export function updateMastery(current: ConceptMastery, result: boolean): ConceptMastery
export function calculateDecay(mastery: ConceptMastery, timeElapsed: number): number
```

**DynamoDB Schema:**
```typescript
// Table: concept-mastery
{
  PK: 'STUDENT#<studentId>',
  SK: 'CONCEPT#<conceptId>',
  masteryLevel: number,
  attempts: number,
  successes: number,
  failures: number,
  lastPracticed: string (ISO date),
  firstAttempt: string (ISO date),
  decayRate: number,
  GSI1PK: 'CONCEPT#<conceptId>', // For querying all students by concept
  GSI1SK: 'MASTERY#<masteryLevel>'
}
```

**Technical Approach:**
1. Create mastery calculation algorithm (weighted recent attempts)
2. Implement DynamoDB operations (create, read, update mastery records)
3. Build mastery decay function (exponential decay based on time)
4. Create API routes for mastery tracking
5. Integrate mastery updates into chat flow

**Mastery Calculation Algorithm:**
```
Mastery = (weighted_success_rate * 100) - decay_penalty

where:
  weighted_success_rate = recent attempts weighted more heavily
  decay_penalty = function of time since last practice
  
Example:
  Last 5 attempts: [success, success, failure, success, success]
  Weights: [1.0, 0.9, 0.8, 0.7, 0.6] (most recent = highest weight)
  Weighted success rate = (1.0 + 0.9 + 0.0 + 0.7 + 0.6) / 5 = 0.64
  Base mastery = 64%
  
  Time since last practice: 7 days
  Decay rate: 5% per week
  Decay penalty: 5%
  
  Final mastery: 64% - 5% = 59%
```

**API Routes:**
```typescript
// POST /api/mastery/update
// Update mastery after problem attempt
{
  studentId: string
  conceptId: string
  success: boolean
}

// GET /api/mastery?studentId=<id>
// Get all concept mastery for student

// GET /api/mastery?studentId=<id>&conceptId=<cid>
// Get specific concept mastery

// GET /api/mastery/weak-concepts?studentId=<id>&limit=10
// Get concepts with lowest mastery
```

**Success Criteria:**
- ✅ Mastery tracked per student per concept
- ✅ Mastery calculated based on weighted recent attempts
- ✅ Decay function reduces mastery over time
- ✅ API routes functional and tested
- ✅ Mastery updates integrated into chat flow

---

### 2.3 Concept-Problem Tagging System

**Objective:** Tag all problems with the concepts they test, enabling concept-based problem selection.

**Implementation:**
- Tag problems manually for common problem types
- Use OpenAI to auto-tag uploaded image problems
- Store problem metadata (concepts, difficulty, type, context)
- Link problems to multiple concepts (e.g., "word problem" + "linear equations" + "real-world application")

**Deliverables:**
```typescript
// app/types/problem.ts
interface Problem {
  id: string
  content: string
  conceptIds: string[] // Multiple concepts per problem
  difficulty: number // 1-10
  type: 'arithmetic' | 'algebra' | 'geometry' | 'word-problem' | 'multi-step'
  context: string // real-world, abstract, visual, etc.
  imageUrl?: string
  createdAt: Date
  source: 'predefined' | 'user-uploaded' | 'generated'
}

// app/utils/problemTagging.ts
export async function autoTagProblem(problemText: string): Promise<string[]>
export function getProblemsByConcepts(conceptIds: string[]): Promise<Problem[]>
export function getProblemsByDifficulty(min: number, max: number): Promise<Problem[]>
```

**OpenAI Auto-Tagging Prompt:**
```
You are a math curriculum expert. Given a math problem, identify all mathematical concepts it tests.

Problem: "A rectangle has a length that is 3 more than twice its width. If the perimeter is 36, what are the dimensions?"

Concepts (return as array of concept IDs):
- linear-equations-1var (solving for variable)
- geometry-perimeter (perimeter formula)
- word-problems (translating text to math)
- algebraic-expressions (2w + 3 expression)

Return JSON array: ["linear-equations-1var", "geometry-perimeter", "word-problems", "algebraic-expressions"]
```

**DynamoDB Schema:**
```typescript
// Table: problems
{
  PK: 'PROBLEM#<problemId>',
  SK: 'METADATA',
  content: string,
  conceptIds: string[],
  difficulty: number,
  type: string,
  context: string,
  imageUrl?: string,
  createdAt: string,
  source: string,
  
  // GSI for concept-based queries
  GSI1PK: 'CONCEPT#<conceptId>',
  GSI1SK: 'DIFFICULTY#<difficulty>'
}
```

**API Routes:**
```typescript
// POST /api/problems/tag
// Auto-tag a problem with concepts
{
  problemText: string
}
// Returns: { conceptIds: string[] }

// GET /api/problems?conceptIds=<id1>,<id2>&difficulty=<min>-<max>
// Get problems by concepts and difficulty

// POST /api/problems
// Create new problem with tags
{
  content: string
  conceptIds: string[]
  difficulty: number
  type: string
  context: string
}
```

**Technical Approach:**
1. Create problem database schema
2. Implement auto-tagging using OpenAI
3. Build problem query system (by concept, difficulty, type)
4. Create API routes for problem management
5. Integrate into chat flow (track which problems attempted)
6. Pre-populate with 100+ common problems

**Success Criteria:**
- ✅ Problems tagged with concepts (manual + auto)
- ✅ Auto-tagging accuracy >90%
- ✅ Problems queryable by concept, difficulty, type
- ✅ 100+ problems pre-populated
- ✅ Integration with chat flow

---

### 2.4 Student Profile System

**Objective:** Create comprehensive student profiles tracking overall progress, strengths, weaknesses.

**Implementation:**
- Store student metadata (name, grade level, goals)
- Track overall progress metrics (total problems, success rate, time spent)
- Identify strong and weak concept areas
- Generate progress reports and insights

**Deliverables:**
```typescript
// app/types/student.ts
interface StudentProfile {
  studentId: string
  name?: string
  gradeLevel?: string
  createdAt: Date
  totalProblems: number
  totalSuccesses: number
  totalTime: number // minutes
  strongConcepts: string[] // Top 5 mastered
  weakConcepts: string[] // Top 5 struggling
  recentActivity: Date
}

// app/utils/studentProfile.ts
export async function getStudentProfile(studentId: string): Promise<StudentProfile>
export async function updateProgress(studentId: string, problemResult: boolean): Promise<void>
export async function getProgressReport(studentId: string): Promise<ProgressReport>
```

**API Routes:**
```typescript
// GET /api/students/<studentId>/profile
// Get complete student profile

// GET /api/students/<studentId>/progress
// Get progress report with insights

// PATCH /api/students/<studentId>
// Update student metadata
{
  name?: string
  gradeLevel?: string
}
```

**Success Criteria:**
- ✅ Student profiles stored and retrievable
- ✅ Progress metrics tracked accurately
- ✅ Strong/weak concepts identified
- ✅ Progress reports generated
- ✅ API routes functional

---

## Integration Points

### Phase 1 (Enhanced Feedback) → Phase 2 (Concept Tracking)
- Feedback analysis identifies which concepts student struggled with
- Failed attempts update mastery levels
- Misconceptions linked to specific concepts

### Phase 2 → Future Phases
- **Phase 3 (Retrieval Practice):** Select concepts for recall challenges based on mastery
- **Phase 4 (Spaced Repetition):** Schedule review of concepts based on mastery and decay
- **Phase 5 (Adaptive Selection):** Choose problems based on concept mastery levels

---

## Implementation Timeline

**Week 1: Concept Taxonomy + Mastery Tracking**
- Days 1-2: Define concept taxonomy (50+ concepts)
- Days 3-4: Implement mastery calculation and storage
- Day 5: Create mastery API routes and test

**Week 2: Problem Tagging + Student Profiles**
- Days 1-2: Implement auto-tagging system
- Day 3: Pre-populate 100+ problems with tags
- Days 4-5: Build student profile system and API routes

**Week 3: Integration + Testing**
- Days 1-2: Integrate mastery tracking into chat flow
- Day 3: Build progress dashboard/reports
- Days 4-5: Comprehensive testing and refinement

---

## Testing Requirements

### Unit Tests
- ✅ Mastery calculation algorithm
- ✅ Decay function
- ✅ Auto-tagging accuracy
- ✅ Concept relationship queries

### Integration Tests
- ✅ Chat flow updates mastery correctly
- ✅ Problems tagged and retrievable
- ✅ Student profiles updated accurately
- ✅ API routes functional end-to-end

### User Testing
- ✅ Test with 10+ students across different levels
- ✅ Validate mastery tracking accuracy
- ✅ Verify auto-tagging quality
- ✅ Ensure progress reports are meaningful

---

## Success Criteria

Phase 2 is complete when:

1. ✅ **Concept Taxonomy**: 50+ concepts defined with hierarchy and prerequisites
2. ✅ **Mastery Tracking**: Per-student per-concept mastery tracked and updated
3. ✅ **Decay Function**: Mastery decays realistically over time
4. ✅ **Problem Tagging**: 100+ problems tagged with concepts
5. ✅ **Auto-Tagging**: >90% accuracy on concept identification
6. ✅ **Student Profiles**: Complete profiles with progress tracking
7. ✅ **API Routes**: All mastery and problem APIs functional
8. ✅ **Integration**: Chat flow updates mastery automatically
9. ✅ **Testing**: Comprehensive testing completed
10. ✅ **Documentation**: Phase 2 docs updated

---

## Next Steps After Phase 2

Once Phase 2 is complete, we move to:

**Phase 3: Retrieval Practice & Active Recall**
- Design recall challenges based on concept mastery
- Implement predictive questioning
- Build step-by-step reasoning capture
- Track recall success rates

Phase 2 provides the foundation (concept tracking) that makes Phase 3's retrieval practice truly adaptive and personalized.

---

## Key Files to Create/Update

### New Files
- `app/data/concepts.ts` - Concept taxonomy
- `app/types/mastery.ts` - Mastery types
- `app/types/problem.ts` - Problem types
- `app/types/student.ts` - Student profile types
- `app/utils/mastery.ts` - Mastery calculation
- `app/utils/problemTagging.ts` - Problem tagging utilities
- `app/utils/studentProfile.ts` - Profile management
- `app/api/mastery/update/route.ts` - Update mastery endpoint
- `app/api/mastery/route.ts` - Get mastery endpoint
- `app/api/problems/tag/route.ts` - Auto-tag endpoint
- `app/api/problems/route.ts` - Problem CRUD endpoints
- `app/api/students/[id]/profile/route.ts` - Student profile endpoint
- `app/api/students/[id]/progress/route.ts` - Progress report endpoint
- `docs/PHASE2_STATUS.md` - Phase 2 progress tracking

### Updated Files
- `app/api/chat/route.ts` - Integrate mastery updates
- `components/ChatContainer.tsx` - Track problem attempts
- `memory-bank/progress.md` - Update with Phase 2 progress

---

**Ready to begin Phase 2 implementation!**

