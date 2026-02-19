# Specification

## Summary
**Goal:** Implement scrollable, searchable location dropdowns with cascading behavior for improved mobile UX.

**Planned changes:**
- Add smooth vertical scrolling to all location dropdowns (State, District, MP, MLA, Mandal, Village) with max-height set to 60-70% of screen height
- Implement search/filter functionality inside each location dropdown for real-time filtering
- Ensure cascading location selection works correctly: Country → State → District → MP → MLA → Mandal → Village, with each level loading data based on parent selection
- Fix mobile responsiveness and touch-friendly scrolling, resolving any z-index or overflow CSS issues
- Optimize dropdown rendering performance to prevent UI freezing with large datasets on Android devices

**User-visible outcome:** Users can smoothly scroll through long location lists, quickly search for locations using the filter, and select their location through the cascading dropdown system without UI freezes or interaction issues on mobile devices.
