# Video Production Standards and Accessibility Guidelines

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** Documentation Team

This document outlines the production standards and accessibility requirements for all BookReview Platform video tutorials.

## Table of Contents

1. [Video Production Standards](#video-production-standards)
2. [Accessibility Requirements](#accessibility-requirements)
3. [Video Structure Guidelines](#video-structure-guidelines)
4. [Captioning Guidelines](#captioning-guidelines)
5. [Audio Description Guidelines](#audio-description-guidelines)
6. [Quality Assurance Checklist](#quality-assurance-checklist)
7. [Production Workflow](#production-workflow)

## Video Production Standards

### Technical Specifications

| Element | Specification |
|---------|--------------|
| Resolution | 1920 × 1080 (1080p) |
| Aspect Ratio | 16:9 |
| Frame Rate | 30 fps |
| Video Codec | H.264 |
| Audio Codec | AAC |
| Audio Channels | Stereo |
| Audio Sample Rate | 48 kHz |
| Audio Bit Rate | 320 kbps |
| Video Bit Rate | 8-10 Mbps |
| File Format | MP4 |

### Visual Style

- **Branding**: All videos must include the BookReview Platform logo and brand colors
- **Intro/Outro**: Standard intro and outro animations (duration: 5 seconds each)
- **Text Overlays**: San Francisco or Roboto font, minimum 24pt size
- **UI Focus**: Yellow highlight with 2px border around UI elements being discussed
- **Cursor**: Large, high-contrast cursor with click animation
- **Transitions**: Simple cuts or dissolves; avoid complex transitions
- **Pacing**: Allow sufficient time for viewers to process information (slower than typical tutorials)

### Audio Guidelines

- **Narration**: Clear, professional voice at a measured pace
- **Volume Levels**: 
  - Narration: -12 to -14 dB
  - Background music: -24 to -30 dB (never competing with narration)
- **Audio Quality**: Record in a sound-treated environment with minimal background noise
- **Microphone**: Use a condenser microphone with pop filter
- **Processing**: Apply noise reduction, light compression, and normalization

## Accessibility Requirements

All BookReview Platform videos must meet the following accessibility requirements:

### Required Features

- **Closed Captions**: All videos must include accurate closed captions
- **Transcripts**: Complete text transcripts must be available
- **Audio Descriptions**: Include when visual information is not conveyed through narration
- **No Flashing Content**: Avoid flashing more than 3 times per second
- **Adequate Contrast**: Ensure all text has a contrast ratio of at least 4.5:1
- **Visual Clarity**: Ensure important information is not conveyed by color alone
- **Sufficient Timing**: On-screen text must remain visible long enough to read (5-7 seconds minimum)
- **Descriptive Narration**: Narration should describe key visual elements for visually impaired users

### Keyboard Navigation

For tutorial videos demonstrating keyboard navigation:

- Show keyboard shortcuts on screen
- Highlight keys being pressed
- Include a keyboard visualization for complex shortcuts
- Verbally describe key combinations as they are demonstrated

### Screen Reader Compatibility

For accessibility-focused tutorials:

- Demonstrate screen reader output audibly
- Show focus states clearly
- Explain ARIA attributes and semantic structure where relevant
- Test with multiple screen readers when possible (JAWS, NVDA, VoiceOver)

## Video Structure Guidelines

### Standard Format

1. **Introduction** (15-30 seconds)
   - Identify the topic and goals of the tutorial
   - Explain who will benefit from the video

2. **Main Content** (Varies by video type)
   - Step-by-step demonstration
   - Clear visual indications of each step
   - Verbal explanation matching visual actions

3. **Summary** (15-30 seconds)
   - Recap key points
   - Suggest next steps or related tutorials

4. **Outro** (5-10 seconds)
   - Call to action
   - Links to resources
   - BookReview Platform branding

### Duration Guidelines

- **Quick Start Guides**: 3-5 minutes
- **Key User Journeys**: 4-6 minutes
- **Feature-Specific Tutorials**: 2-3 minutes
- **Accessibility Tutorials**: 3-4 minutes

## Captioning Guidelines

All videos must include properly synchronized closed captions that:

### Caption Format

- Display in a sans-serif font with good contrast against a semi-transparent background
- Appear at the bottom of the screen (unless visual elements require alternative placement)
- Include no more than 2 lines of text at a time
- Contain no more than 32 characters per line
- Remain on screen for 3-7 seconds depending on text amount

### Caption Content

- Include all spoken dialogue
- Identify speakers when multiple voices are present
- Describe relevant non-speech sounds in square brackets, e.g., [mouse clicks], [gentle music playing]
- Use proper punctuation and capitalization
- Break at natural linguistic points (not mid-sentence)
- Indicate emphasis where critical to understanding
- Include timestamps for synchronization with video

### Multilingual Captions

- English captions must be created first and serve as the master file
- Translation into other languages should preserve meaning rather than literal translation
- Localization should accommodate cultural differences in examples or references

## Audio Description Guidelines

Audio descriptions must be provided for visually complex tutorials where significant information is conveyed only visually.

### Requirements

- Describe key visual elements not covered in the narration
- Insert descriptions during natural pauses when possible
- Use clear, concise language
- Focus on elements essential to understanding the content
- Create a separate audio-described version if extended descriptions are needed

## Quality Assurance Checklist

All videos must pass this QA checklist before publication:

### Technical QA

- [ ] Video plays at correct resolution and aspect ratio
- [ ] Audio is clear and at proper levels
- [ ] No unexpected glitches, freezes, or artifacts
- [ ] Intro and outro animations render correctly
- [ ] File size is optimized for streaming

### Content QA

- [ ] All steps are shown clearly and explained accurately
- [ ] Navigation paths and UI elements match the current platform version
- [ ] No outdated information or deprecated features
- [ ] No errors in demonstrations or explanations
- [ ] Verbal and visual instructions are synchronized

### Accessibility QA

- [ ] Closed captions are accurate and synchronized
- [ ] Transcript is complete and properly formatted
- [ ] Audio descriptions are provided where necessary
- [ ] No flashing content exceeding safety thresholds
- [ ] Text maintains adequate contrast
- [ ] On-screen text remains visible for sufficient time
- [ ] Keyboard navigation is shown clearly where applicable
- [ ] Screen reader interactions are demonstrated effectively

## Production Workflow

### Pre-Production

1. **Script Development**
   - Create script based on tutorial type
   - Include visual directions and narration text
   - Obtain approval from subject matter experts

2. **Storyboarding**
   - Create visual outline of key frames
   - Plan transitions and animations
   - Identify areas needing special focus

3. **Environment Setup**
   - Prepare recording environment with test data
   - Ensure platform is running latest version
   - Set up screen recording with proper settings

### Production

1. **Recording**
   - Record narration in professional audio environment
   - Capture screen activity at 1080p/30fps
   - Create any needed animations or graphics

2. **Editing**
   - Combine narration with screen recording
   - Add intro and outro animations
   - Insert callouts, highlights, and text overlays
   - Apply transitions and timing adjustments

3. **Accessibility Features**
   - Generate initial captions from transcript
   - Synchronize captions with audio
   - Create audio descriptions if needed
   - Produce full transcript document

### Post-Production

1. **Quality Assurance**
   - Technical review
   - Content accuracy review
   - Accessibility compliance check
   - User testing with target audience

2. **Revisions**
   - Address QA feedback
   - Update any outdated content
   - Fix any accessibility issues

3. **Publishing**
   - Export final files in required formats
   - Upload to video hosting platform
   - Add metadata and tags
   - Embed in relevant documentation

4. **Maintenance**
   - Schedule periodic review
   - Update when UI changes significantly
   - Create version history

By following these standards and guidelines, we ensure all BookReview Platform video tutorials are professional, consistent, and accessible to all users.

*Last Updated: August 31, 2025*
