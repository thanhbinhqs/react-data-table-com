# Reusable Data Table Component

Create a highly reusable React table component with comprehensive filtering, sorting, and column management capabilities for displaying tabular data efficiently.

**Experience Qualities**:
1. **Intuitive**: Users can immediately understand how to interact with data through clear visual cues
2. **Performant**: Large datasets load quickly with smooth interactions and responsive filtering
3. **Flexible**: Adapts to various data types and use cases with configurable columns and filters

**Complexity Level**: Light Application (multiple features with basic state)
The component provides essential data table functionality with state management for filters, sorting, and column visibility without requiring complex backend integration.

## Essential Features

### Interactive Data Table
- **Functionality**: Display data in sortable, filterable columns with resize capabilities
- **Purpose**: Present large datasets in an organized, searchable format
- **Trigger**: Component renders with provided data and column definitions
- **Progression**: Data loads → User views table → Interacts with headers for sorting → Adjusts column widths
- **Success criteria**: All data displays correctly, sorting works bidirectionally, columns resize smoothly

### Sidebar Filter Panel
- **Functionality**: Collapsible sidebar with filter controls for each applicable column
- **Purpose**: Allow users to narrow down data based on specific criteria
- **Trigger**: User clicks filter icon or sidebar toggle
- **Progression**: Click filter → Sidebar opens → Select filter criteria → Click Apply → Data updates → Clear resets filters
- **Success criteria**: Filters apply correctly, data updates in real-time, clear function resets all filters

### Column Management
- **Functionality**: Show/hide columns, resize column widths, reorder columns
- **Purpose**: Customize table view for different workflows and screen sizes
- **Trigger**: User interacts with column headers or column settings
- **Progression**: Access column controls → Toggle visibility → Drag to resize → Save preferences
- **Success criteria**: Column changes persist during session, responsive layout maintained

### Search and Sort
- **Functionality**: Global search across all columns, individual column sorting
- **Purpose**: Quick data discovery and organization
- **Trigger**: User types in search box or clicks column headers
- **Progression**: Type search → Results filter instantly → Click header → Data sorts → Click again → Reverse sort
- **Success criteria**: Search highlights matches, sorting maintains other applied filters

## Edge Case Handling
- **Empty Data States**: Display helpful empty state with sample data prompts
- **Loading States**: Show skeleton loading animation while data fetches
- **Error Handling**: Display clear error messages with retry options
- **Mobile Responsive**: Table adapts to smaller screens with horizontal scroll
- **Large Datasets**: Implement virtual scrolling for 1000+ rows
- **Invalid Filter Values**: Gracefully handle and validate filter inputs

## Design Direction
The design should feel clean, professional, and data-focused with subtle interactions that enhance rather than distract from the content - minimal interface that prioritizes readability and quick data scanning.

## Color Selection
Complementary (opposite colors) - Using a cool blue primary with warm accent touches to create clear visual hierarchy while maintaining professional appearance.

- **Primary Color**: Cool Blue (oklch(0.6 0.15 240)) - Communicates trust and data reliability
- **Secondary Colors**: Light Gray (oklch(0.95 0.01 240)) for backgrounds, Medium Gray (oklch(0.7 0.02 240)) for borders
- **Accent Color**: Warm Orange (oklch(0.7 0.15 45)) - Attention-grabbing highlight for active filters and CTAs
- **Foreground/Background Pairings**: 
  - Background White (oklch(1 0 0)): Dark Gray text (oklch(0.2 0.01 240)) - Ratio 15.8:1 ✓
  - Primary Blue (oklch(0.6 0.15 240)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Secondary Gray (oklch(0.95 0.01 240)): Dark Gray text (oklch(0.2 0.01 240)) - Ratio 14.8:1 ✓
  - Accent Orange (oklch(0.7 0.15 45)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓

## Font Selection
Typography should convey clarity and precision with excellent readability at small sizes for data-dense tables - Inter font family for its exceptional legibility in tabular formats.

- **Typographic Hierarchy**: 
  - H1 (Component Title): Inter Bold/24px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/18px/normal spacing  
  - Table Headers: Inter Medium/14px/wide letter spacing
  - Table Data: Inter Regular/14px/normal spacing
  - Filter Labels: Inter Medium/12px/normal spacing
  - Helper Text: Inter Regular/11px/normal spacing

## Animations
Subtle and functional animations that provide immediate feedback without slowing down data interaction workflows - focus on micro-interactions that confirm user actions.

- **Purposeful Meaning**: Quick hover states on interactive elements, smooth sidebar slide transitions, and gentle loading animations maintain the professional data-focused experience
- **Hierarchy of Movement**: Filter application (300ms), column resize (150ms), sort indicators (200ms), sidebar toggle (250ms)

## Component Selection
- **Components**: Table (custom with TanStack), Sheet (sidebar), Button (primary/secondary variants), Input (search/filter fields), Select (dropdowns), Checkbox (column visibility), Separator (visual breaks)
- **Customizations**: Custom table header with resize handles, custom filter components for different data types, responsive column layouts
- **States**: 
  - Table rows: hover (light gray background), selected (blue accent border)
  - Filter inputs: focus (blue border), filled (subtle background), error (red border)
  - Buttons: hover (color deepening), active (pressed state), disabled (muted appearance)
- **Icon Selection**: Sort arrows (phosphor CaretUp/Down), Filter (phosphor FunnelSimple), Search (phosphor MagnifyingGlass), Close (phosphor X), Resize (phosphor DotsSixVertical)
- **Spacing**: Consistent 4px base unit - table padding (12px), button padding (8px 16px), input padding (8px 12px)
- **Mobile**: Table becomes horizontally scrollable with sticky first column, filters move to bottom sheet, search moves to sticky header