---
name: Kinetic Dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#002e69'
  tertiary-container: '#d8e2ff'
  on-tertiary-container: '#0060cc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  data-numeric:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter: 12px
---

## Brand & Style

The design system is built on a "High-Contrast Utilitarian" aesthetic, specifically tailored for the high-intensity environment of a gym. It prioritizes immediate legibility and "at-a-glance" data consumption. The brand personality is disciplined, energetic, and precise. It avoids decorative fluff in favor of raw functionalism, using heavy borders and extreme tonal shifts to guide the user's eye toward active inputs and progress metrics. The emotional response should be one of focused momentum—moving the user quickly through logging tasks so they can return to their workout.

## Colors

The palette is strictly dark-mode by default to reduce eye strain in dimly lit gym environments and to save battery on OLED mobile devices. The primary accent is a high-visibility "Volt Green" (#CCFF00), used exclusively for primary actions, completion states, and positive progression. A secondary "Electric Blue" is utilized for secondary data visualizations and interactive links. Backgrounds utilize deep blacks and dark grays to create a tiered hierarchy of surfaces. High-contrast white text is used for primary content, while mid-tone grays are reserved for secondary labels to maintain a clear information architecture.

## Typography

This design system utilizes a dual-font strategy to balance technical precision with athletic readability. **Space Grotesk** is used for headlines and large numeric data displays; its geometric, slightly futuristic construction reinforces the "utilitarian" feel. **Lexend** is used for all body copy and input labels; its design is specifically optimized for reading speed and clarity, which is critical when a user is fatigued. 

- Use **Uppercase Label Bold** for all form headers and small metadata.
- **Data Numeric** should be used for weight, reps, and timer displays to ensure they are the most prominent elements on the screen.

## Layout & Spacing

The layout follows a strict **Fluid Grid** model designed for a PWA experience. It uses an 8px base grid system to ensure vertical rhythm. On mobile, the system adheres to a 4-column structure with 16px side margins. 

The layout philosophy emphasizes "Touch Targets over Whitespace." Because users may have sweaty or shaky hands, interactive elements are oversized with generous padding. Spacing between distinct exercise "sets" should be significantly larger (xl) than the spacing between inputs within a set (md) to provide clear visual grouping.

## Elevation & Depth

This design system eschews soft shadows in favor of **Tonal Layers** and **Bold Borders**. 

1. **Base Layer:** Pure black (#000000) for the main application background.
2. **Surface Layer:** Dark gray (#121212) for cards and containers.
3. **Interactive Layer:** Elements like input fields use a 1px solid border (#2C2C2E) which brightens to the primary accent color when focused.

Depth is communicated through "recession" rather than "elevation." Inputs appear "cut into" the surface, while primary buttons and active status badges sit on the highest perceived plane due to their high-saturation color.

## Shapes

The shape language is "Soft-Industrial." A uniform 0.25rem (4px) border radius is applied to most components to maintain a disciplined, rigid look while preventing the interface from feeling dangerously sharp. 

- **Standard Elements:** 4px radius (Buttons, Inputs, Cards).
- **Status Badges/Chips:** Full pill-shape for immediate differentiation from actionable buttons.
- **Data Bars:** Square ends to maximize the visual "fill" area for progress tracking.

## Components

### Buttons
- **Primary:** Background in Volt Green (#CCFF00), text in Black (#000000), bold weight. 
- **Secondary:** Transparent background, 2px border in Volt Green, text in White.
- **Ghost:** No background or border, text in White with an icon.

### Input Fields (Workout Entry)
Inputs are the core of this system. They should feature large, center-aligned numeric text. The background is a slightly lighter gray than the card it sits on, with a subtle bottom-border that glows Volt Green when active.

### Progression Badges
Small, high-contrast chips used to show PRs (Personal Records) or streaks. These use the Secondary Blue (#007AFF) background with white text to distinguish "Information" from the "Action" of the Primary Green.

### Data Visualizations
Charts should be simplified sparklines or bar graphs. Use the Primary color for the current workout data and a muted mid-gray for "Previous Session" ghosted in the background for immediate comparison.

### Workout Lists
List items should be separated by high-contrast dividers (1px, #1C1C1E). Each item should have a "hit area" spanning the full width of the screen to accommodate quick navigation between exercises.