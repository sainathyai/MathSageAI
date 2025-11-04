# Testing Guide - Phase 1: Enhanced Feedback System

## Pre-Testing Checklist

### Environment Setup
- [ ] Ensure `.env.local` exists with `OPENAI_API_KEY` set
- [ ] Verify Node.js and npm are installed
- [ ] Run `npm install` to ensure all dependencies are installed

### Server Status
- [ ] Dev server is running (`npm run dev`)
- [ ] Server accessible at http://localhost:3000
- [ ] No build errors in console

## Testing Scenarios

### 1. Basic Chat Functionality

**Test**: Send a simple message
- [ ] Open http://localhost:3000
- [ ] Type a message in the chat input
- [ ] Click send
- [ ] Verify AI response appears
- [ ] Verify response uses Socratic method (asks questions, doesn't give direct answers)

**Expected**: AI responds with guiding questions, not direct answers

---

### 2. Image Upload & Parsing

**Test**: Upload a math problem image
- [ ] Click image upload button in chat input
- [ ] Select an image file with a math problem
- [ ] Verify image appears in chat
- [ ] Verify problem text is extracted and displayed
- [ ] Send message with parsed problem
- [ ] Verify AI responds appropriately

**Expected**: Image is parsed correctly, problem text extracted

---

### 3. Example Problem Selection

**Test**: Select an example problem
- [ ] On welcome screen, click an example problem
- [ ] Verify problem is sent to chat
- [ ] Verify AI responds with Socratic questions
- [ ] Continue conversation

**Expected**: AI guides through example problem using Socratic method

---

### 4. Error Detection & Feedback (Phase 1)

**Test**: Submit incorrect solution attempt
- [ ] Send a math problem (e.g., "Solve 2x + 5 = 15")
- [ ] Wait for AI to ask guiding questions
- [ ] Respond with an incorrect solution attempt (e.g., "x = 10" or showing incorrect steps)
- [ ] Verify AI detects the error
- [ ] Verify AI provides step-by-step feedback
- [ ] Verify error is classified (calculation, conceptual, or procedural)
- [ ] Verify misconception detection (if applicable)
- [ ] Verify encouraging feedback is provided

**Expected**: 
- AI identifies where error occurred (not just final answer)
- Error is classified correctly
- Specific guidance is provided
- Encouragement is included

---

### 5. Turn Counting & Hint Escalation

**Test**: Multiple turns with struggling student
- [ ] Send a problem
- [ ] Respond with incorrect attempts (2+ turns)
- [ ] Verify AI provides more concrete hints after 2+ turns
- [ ] Verify hints still guide through questions (not direct answers)

**Expected**: Hints become more concrete after 2+ turns, but still Socratic

---

### 6. Response Validation

**Test**: AI should never give direct answers
- [ ] Send various problems
- [ ] Verify AI never says "the answer is X" or directly solves
- [ ] Verify responses are always questions or guiding statements

**Expected**: No direct answers, always Socratic guidance

---

### 7. Error Types Testing

**Test**: Different error types

#### Calculation Errors
- [ ] Submit problem with arithmetic mistake (e.g., "2 + 3 = 6")
- [ ] Verify error is classified as "calculation"
- [ ] Verify feedback addresses arithmetic

#### Conceptual Errors
- [ ] Submit problem with misunderstanding (e.g., wrong concept applied)
- [ ] Verify error is classified as "conceptual"
- [ ] Verify feedback addresses understanding

#### Procedural Errors
- [ ] Submit problem with wrong method (e.g., using addition instead of multiplication)
- [ ] Verify error is classified as "procedural"
- [ ] Verify feedback addresses approach

**Expected**: Each error type is correctly identified and addressed

---

### 8. Misconception Detection

**Test**: Common misconceptions
- [ ] Submit problem showing common misconception (e.g., negative signs, order of operations)
- [ ] Verify misconception is detected
- [ ] Verify specific guidance for that misconception

**Expected**: Common misconceptions are identified and addressed

---

### 9. Multiple Problem Types

**Test**: Various problem types
- [ ] Arithmetic problems
- [ ] Algebra problems
- [ ] Geometry problems
- [ ] Word problems
- [ ] Multi-step problems

**Expected**: AI handles all problem types appropriately

---

### 10. Error Handling

**Test**: Error scenarios
- [ ] Invalid API key (should show error message)
- [ ] Network error (should handle gracefully)
- [ ] Empty message (should prevent sending)
- [ ] Very long message (should handle appropriately)

**Expected**: Errors are handled gracefully with user-friendly messages

---

## Testing Checklist Summary

### Core Functionality
- [x] Basic chat works
- [ ] Image upload works
- [ ] Example problems work
- [ ] Socratic method maintained

### Phase 1: Enhanced Feedback
- [ ] Step-by-step error analysis
- [ ] Error classification (calculation, conceptual, procedural)
- [ ] Misconception detection
- [ ] Specific feedback provided
- [ ] Encouragement included
- [ ] Next steps suggested

### Advanced Features
- [ ] Turn counting works
- [ ] Hint escalation works
- [ ] Response validation prevents direct answers
- [ ] Multiple error types handled
- [ ] Various problem types supported

---

## Known Issues to Test

### Potential Issues
1. **API Key Missing**: If `.env.local` is missing or API key is invalid
   - **Expected**: Clear error message
   - **Fix**: Check `.env.local` file

2. **Image Parsing Fails**: If image is unclear or not a math problem
   - **Expected**: Error message or fallback
   - **Fix**: Verify image quality and format

3. **Response Validation Too Strict**: If valid Socratic responses are flagged
   - **Expected**: Only direct answers are flagged
   - **Fix**: Adjust validation patterns

4. **Error Classification Inaccurate**: If errors are misclassified
   - **Expected**: Errors classified correctly
   - **Fix**: Refine classification logic

---

## Performance Testing

### Response Times
- [ ] Chat response < 5 seconds
- [ ] Image parsing < 10 seconds
- [ ] UI remains responsive during loading

### Error Recovery
- [ ] App recovers from API errors
- [ ] Retry mechanism works (if implemented)
- [ ] User can continue after errors

---

## Browser Compatibility

### Test in Multiple Browsers
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

### Responsive Design
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Desktop view works

---

## Next Steps After Testing

1. **Document Issues**: Note any bugs or unexpected behavior
2. **Refine Feedback**: Adjust feedback generation based on results
3. **Improve Error Detection**: Enhance misconception detection
4. **Optimize Performance**: Address any slow responses
5. **User Testing**: Test with actual users if possible

---

## Testing Commands

```bash
# Start dev server
npm run dev

# Run build check
npm run build

# Check for linting errors
npm run lint

# Type check (if using TypeScript)
npm run type-check
```

---

## Success Criteria

Phase 1 is successful if:
1. ✅ All core functionality works
2. ✅ Error detection works (step-by-step analysis)
3. ✅ Error classification works (>80% accuracy)
4. ✅ Misconception detection works (>80% accuracy)
5. ✅ Feedback is specific and actionable
6. ✅ No direct answers are given
7. ✅ Socratic method is maintained
8. ✅ UI is responsive and user-friendly

---

**Status**: Ready for testing
**Last Updated**: Phase 1 Foundation Complete

