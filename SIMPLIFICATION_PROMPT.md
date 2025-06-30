# 🚀 Component System Simplification Prompt

## Context
The Executive Dysfunction Center component system has become over-engineered with excessive abstractions, unused props, and complex interfaces that hurt developer experience and maintainability. Based on the analysis in `OVER_ENGINEERING_ANALYSIS.md`, we need to systematically simplify while preserving core accessibility and executive dysfunction support features.

## Prompt Template

```
You are an expert React/TypeScript developer specializing in component system architecture and developer experience optimization. 

GOAL: Simplify the Executive Dysfunction Center component system by removing over-engineering while preserving essential accessibility and executive dysfunction support features.

CONSTRAINTS:
- Maintain 100% accessibility compliance (WCAG AA)
- Preserve core executive dysfunction features (priority indicators, help text)
- Keep TypeScript type safety
- Maintain backward compatibility where possible
- Follow "convention over configuration" philosophy
- Optimize for the 80/20 rule (80% of value from 20% of features)

SPECIFIC TASKS:

1. **Component Interface Simplification**
   - Consolidate 15+ interfaces in types/components.ts into 3-4 practical interfaces
   - Remove unused props (estimated 70% are never used in practice)
   - Keep only essential accessibility props (aria-label, aria-describedby, aria-invalid)
   - Preserve priority and helpText for executive dysfunction support
   - Remove duplicate props (complexity vs difficulty, helpText vs helperText)

2. **Input Component Streamlining** 
   - Simplify InputProps interface from 5 extended interfaces to direct props
   - Remove ExecutiveDysfunctionProps, ValidationProps, EventHandlerProps extensions
   - Keep: label, error, helperText, loading, startIcon, endIcon, priority
   - Remove: estimatedTime, complexity, difficulty, examples, showBreakSuggestion
   - Maintain controlled component pattern with standard onChange

3. **Layout System Simplification**
   - Replace Grid, GridItem, Stack, Container components with single Layout component
   - Use CSS Grid and Flexbox utilities instead of complex variants system
   - Remove unnecessary props: useContainerQuery, simplifyLayout, showSeparators
   - Focus on essential layout patterns: grid, flex, container width

4. **Design Token Optimization**
   - Reduce 20+ spacing variables to 6 core variables: --space-xs through --space-2xl
   - Remove cognitive load variables (tight/normal/relaxed)
   - Keep essential brand colors and semantic colors
   - Align with Tailwind's spacing scale for consistency

5. **Select Component Replacement**
   - Replace 400+ line StandardizedSelect with native select or proven library
   - If custom needed, limit to essential props: options, value, onChange, error, loading
   - Remove search, grouping, descriptions unless specifically needed

IMPLEMENTATION APPROACH:
1. Start with types/components.ts - create new simplified interfaces
2. Update Input component to use simplified interface
3. Create single Layout component to replace grid system
4. Update CSS variables to simplified spacing scale
5. List all files modified and explain changes
6. Provide migration guide for existing component usage

CODE QUALITY REQUIREMENTS:
- Use clear, modern TypeScript patterns
- Add necessary imports and exports
- Maintain accessibility features (ARIA attributes)
- Use CSS variables for theming
- Add comments for complex logic only
- Follow React best practices (forwardRef, proper event handling)
- Ensure components are still testable

PRESERVE THESE EXECUTIVE DYSFUNCTION FEATURES:
- Priority indicators (high, urgent) with visual styling
- Help text for guidance
- Loading states for async operations
- Error states with clear messaging
- Keyboard navigation support
- Screen reader compatibility

REMOVE THESE OVER-ENGINEERED FEATURES:
- Estimated time calculations
- Complexity/difficulty assessments
- Step counting (unless in stepper component)
- Break suggestions
- Cognitive load scoring
- Multiple spacing systems
- Unused animation props
- Theoretical flexibility props

OUTPUT FORMAT:
- List all files to be modified
- Show before/after code examples for key changes
- Explain how changes preserve essential functionality
- Provide component usage examples with simplified APIs
- Document any breaking changes and migration path
- Estimate bundle size and complexity reduction

TESTING APPROACH:
- Ensure existing components still render without errors
- Verify accessibility features still work
- Test that executive dysfunction users can still use core features
- Validate TypeScript compilation
- Check that styling and behavior remain consistent
```

## Example Usage

```typescript
// BEFORE: Over-engineered
<Input
  label="Task name"
  helperText="Enter a descriptive name"
  complexity="moderate"
  difficulty="medium" 
  estimatedTime={5}
  priority="high"
  examples={["Buy groceries"]}
  showBreakSuggestion={true}
  validationState="pending"
  loading={false}
  loadingText="Validating..."
/>

// AFTER: Simplified
<Input
  label="Task name"
  helperText="Enter a descriptive name"
  priority="high"
  loading={isValidating}
  error={errors.name}
/>
```

## Success Criteria

- [ ] Component prop count reduced by 70%
- [ ] Interface complexity reduced by 80%
- [ ] Bundle size reduced by 30%
- [ ] Developer onboarding time reduced by 50%
- [ ] Accessibility compliance maintained at 100%
- [ ] Core executive dysfunction features preserved
- [ ] TypeScript compilation without errors
- [ ] Existing component instances still render
- [ ] Performance improved (faster builds, smaller bundles)
- [ ] Code maintainability significantly improved