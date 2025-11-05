# Math-Focused Whiteboard Features

## Overview
This document outlines math-specific features to transform the whiteboard into a powerful teaching tool for mathematics.

## Key Features for Math Teaching

### 1. Math Formula Input Panel
**Purpose:** Allow students to type equations using LaTeX or visual editor

**Features:**
- LaTeX input field with live preview
- Visual equation builder (drag-and-drop)
- Common math symbols toolbar
- Auto-complete for common formulas
- Integration with KaTeX rendering

**Teaching Use Cases:**
- Students can type equations: `x^2 + 5x + 6 = 0`
- Teacher can show step-by-step: `x^2 + 5x + 6 = 0` → `(x + 2)(x + 3) = 0`
- Visual formula building helps students understand structure

### 2. Coordinate Plane / Graph Paper
**Purpose:** Visualize functions, equations, and geometric concepts

**Features:**
- Toggle between grid and coordinate plane
- Axes with labels (x, y)
- Origin marking
- Scale controls (1 unit, 0.5 units, etc.)
- Quadrant labels

**Teaching Use Cases:**
- Plot functions: `y = 2x + 3`
- Visualize inequalities: Shade regions
- Geometry: Plot points, lines, shapes
- Data visualization: Scatter plots

### 3. Number Line Tool
**Purpose:** Visualize numbers, inequalities, and operations

**Features:**
- Horizontal number line
- Scale controls
- Mark points
- Highlight ranges
- Show inequalities with arrows

**Teaching Use Cases:**
- Number operations: `3 + 5 = 8`
- Inequalities: `x > 5`
- Absolute value: `|x| = 3`
- Fractions and decimals placement

### 4. Geometric Shape Tools (Enhanced)
**Purpose:** Draw and measure geometric shapes accurately

**Features:**
- Shapes with dimension labels
- Angle measurement (protractor visual)
- Distance measurement (ruler visual)
- Snap to grid for precision
- Area/perimeter calculations

**Teaching Use Cases:**
- Geometry problems: "Find area of triangle"
- Angle relationships: Complementary, supplementary
- Transformations: Reflections, rotations
- Congruence and similarity

### 5. Step-by-Step Work Area
**Purpose:** Organize problem-solving process

**Features:**
- Sectioned workspace (Given, Find, Solution)
- Step numbering
- Line-by-line equation solving
- Scratch work area
- Final answer box

**Teaching Use Cases:**
- Show complete solution process
- Students can practice organized thinking
- Teacher can annotate steps
- Highlight key concepts per step

### 6. Math Symbols Palette
**Purpose:** Quick access to common mathematical symbols

**Features:**
- Greek letters (α, β, θ, π, etc.)
- Operators (∑, ∫, √, ±, etc.)
- Relations (=, ≠, <, >, ≤, ≥, etc.)
- Set notation (∈, ∉, ∪, ∩, etc.)
- Special numbers (∞, π, e)

**Teaching Use Cases:**
- Quick symbol insertion
- Teaching notation
- Building complex expressions

### 7. Function Plotter
**Purpose:** Visualize mathematical functions

**Features:**
- Input function: `f(x) = x^2 + 2x - 3`
- Plot multiple functions
- Show intercepts, vertex, asymptotes
- Derivative visualization
- Integration area shading

**Teaching Use Cases:**
- Algebra: Quadratic functions
- Calculus: Derivatives, integrals
- Graphing techniques
- Transformations of functions

### 8. AI Integration Features
**Purpose:** Intelligent feedback and guidance

**Features:**
- Analyze drawn equations
- Check work correctness
- Provide hints without answers
- Suggest next steps
- Identify common mistakes

**Teaching Use Cases:**
- Real-time feedback
- Guided practice
- Error correction
- Adaptive learning

### 9. Visual Problem Solving Templates
**Purpose:** Pre-structured workspaces for common problem types

**Templates:**
- **Linear Equations:** Equation → Steps → Solution
- **Word Problems:** Diagram → Variables → Equations → Solution
- **Geometry:** Given → Diagram → Find → Solution
- **Fractions:** Visual representation → Operations → Simplification
- **Graphing:** Points → Graph → Analysis

**Teaching Use Cases:**
- Structured practice
- Teaching problem-solving strategies
- Consistent format across problems

### 10. Measurement and Calculation Tools
**Purpose:** Interactive measurement and computation

**Features:**
- Measure drawn line lengths
- Calculate angles
- Area calculator
- Perimeter calculator
- Distance between points

**Teaching Use Cases:**
- Hands-on geometry
- Verify calculations
- Real-world applications

## Implementation Priority

### Phase 1: Core Math Features (MVP)
1. ✅ Math formula input with LaTeX
2. ✅ Coordinate plane toggle
3. ✅ Number line tool
4. ✅ Enhanced math symbols palette

### Phase 2: Advanced Features
5. Step-by-step work area
6. Function plotter
7. Enhanced geometric tools
8. AI integration for feedback

### Phase 3: Advanced Tools
9. Visual templates
10. Measurement tools
11. Collaborative features

## Integration with Socratic Method

### How Whiteboard Enhances Socratic Teaching

1. **Visual Learning:** Students can draw what they're thinking
2. **Guided Discovery:** AI can suggest visualizations without giving answers
3. **Step-by-Step:** Teacher can guide through visual steps
4. **Error Visualization:** Show mistakes visually to correct understanding
5. **Multiple Representations:** Same problem in different formats

### Example Teaching Flow

**Problem:** "Solve: 2x + 5 = 13"

1. **Student draws on whiteboard:** Number line or equation
2. **AI asks:** "What operation do we need to undo first?"
3. **Student draws:** Subtracts 5 from both sides
4. **AI asks:** "What do you have now?"
5. **Student shows:** `2x = 8`
6. **AI guides:** "Now how do we isolate x?"
7. **Student completes:** `x = 4`
8. **AI verifies:** Shows checkmark, asks to verify

## Technical Considerations

### Libraries Needed
- **KaTeX:** Already in use for math rendering
- **Function Plotter:** Consider `function-plot` or `plotly.js`
- **LaTeX Input:** `react-latex` or custom implementation
- **Canvas Enhancement:** Extend current canvas with math tools

### Data Structure
- Save whiteboard state with math expressions
- Store LaTeX formulas separately
- Track drawing history for undo/redo
- Link to chat messages

### Performance
- Optimize canvas rendering for math elements
- Lazy load function plotter
- Cache rendered formulas
- Efficient undo/redo with math expressions


