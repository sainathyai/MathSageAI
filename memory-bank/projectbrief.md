# MathSageAI - Project Brief

## Project Overview

**Project Name:** MathSageAI - AI Math Tutor

**Timeline:** 3-5 days core development + optional stretch features

**Date Started:** November 3, 2025

## Objective

Build an AI-powered math tutor that guides students through math problems using the Socratic method. The system accepts problems via text input or image uploads and helps students discover solutions through guided dialogue, never providing direct answers.

## Core Philosophy

The Socratic Method - Guide through questions, never give direct answers:
- Ask guiding questions: "What information do we have?" "What method might help?"
- Provide hints after 2+ turns of being stuck
- Use encouraging, supportive language
- Validate student responses positively
- Help students discover solutions themselves

## Success Criteria

1. Guides students through 5+ problem types without giving direct answers
2. Maintains conversation context throughout sessions
3. Adapts to student understanding level
4. Image parsing works accurately for math problems
5. Deployed and accessible application

## Problem Types Supported

- Arithmetic problems (addition, subtraction, multiplication, division)
- Algebra equations (linear, quadratic)
- Geometry problems (area, perimeter, angles)
- Word problems
- Multi-step problems

## Core Features (MVP - Days 1-5)

1. **Problem Input**
   - Text entry for math problems
   - Image upload with OCR/Vision LLM parsing
   - Support for both printed and handwritten text

2. **Socratic Dialogue**
   - Multi-turn conversation with context
   - Guiding questions (never direct answers)
   - Response validation
   - Hint escalation after multiple turns
   - Encouraging tone

3. **Math Rendering**
   - LaTeX/KaTeX rendering for equations
   - Inline and block math support
   - Display in both user input and AI responses

4. **Web Interface**
   - Clean chat UI
   - Image upload capability
   - Conversation history
   - Responsive design
   - Loading states and error handling

## Stretch Features (Post-MVP)

### High Value
- Interactive whiteboard for visual explanations
- Step-by-step visualization of solutions
- Voice interface (text-to-speech + speech-to-text)

### Polish
- Animated tutor avatar with expressions
- Difficulty modes (beginner, intermediate, advanced)
- Problem generation for practice

## Target Users

- Students learning mathematics (middle school through high school)
- Self-learners seeking guided assistance
- Educators as a supplementary teaching tool

## Key Differentiator

Unlike traditional math tutors or calculators, MathSageAI:
- Never gives direct answers
- Guides students to discover solutions themselves
- Adapts questioning based on student responses
- Maintains encouraging, supportive tone
- Helps build understanding, not just solve problems

## Evaluation Criteria

1. **Pedagogical Quality (35%)**: Genuine guidance without giving answers
2. **Technical Implementation (30%)**: Parsing works, context maintained
3. **User Experience (20%)**: Intuitive interface, responsive
4. **Innovation (15%)**: Creative features and implementation

## Deliverables

1. Deployed application (or local with clear setup)
2. GitHub repository with clean code structure
3. Documentation:
   - README with setup instructions
   - 5+ example problem walkthroughs
   - Prompt engineering notes
4. 5-minute demo video showing:
   - Text input
   - Image upload
   - Socratic dialogue
   - Stretch features (if built)

## Contact

**Instructor:** John Chen  
**Email:** john.chen@superbuilders.school  
**Program:** Gauntlet C3

---

*This project brief is the foundation document that shapes all other memory bank files.*
