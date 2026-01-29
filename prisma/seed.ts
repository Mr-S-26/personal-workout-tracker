import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ParsedExercise {
  name: string;
  order: number;
  targetSets: number;
  targetReps: string;
  targetWeight?: string;
  notes?: string;
}

function parseWorkoutRoutine(markdown: string) {
  const templates: Array<{
    name: string;
    description: string;
    category: string;
    exercises: ParsedExercise[];
  }> = [];

  // First, parse the Daily Warm-up
  const warmupTemplate = parseDailyWarmup(markdown);
  if (warmupTemplate) {
    templates.push(warmupTemplate);
  }

  // Split by day headers (MONDAY, TUESDAY, etc.)
  const dayPattern = /^## (MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY) - (.+)$/gm;
  const matches = Array.from(markdown.matchAll(dayPattern));

  console.log(`Found ${matches.length} day sections`);

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const day = match[1];
    const title = match[2];

    // Get content between this day and the next day (or end of file)
    const startIdx = match.index! + match[0].length;
    const endIdx = i < matches.length - 1 ? matches[i + 1].index! : markdown.length;
    const content = markdown.substring(startIdx, endIdx);

    // Parse all exercises from this day's content
    const exercises = parseAllExercisesFromDay(content, day);

    console.log(`${day}: Found ${exercises.length} exercises`);

    if (exercises.length > 0) {
      templates.push({
        name: `${day} - ${title}`,
        description: `${day} complete training routine`,
        category: day,
        exercises,
      });
    }
  }

  return templates;
}

function parseDailyWarmup(markdown: string) {
  const warmupPattern = /^## DAILY WARM-UP[\s\S]*?(?=^##\s+[A-Z])/m;
  const warmupMatch = markdown.match(warmupPattern);

  if (!warmupMatch) {
    console.log('Daily warm-up not found');
    return null;
  }

  const warmupContent = warmupMatch[0];
  const exercises: ParsedExercise[] = [];
  let order = 1;

  // Parse ball handling drills
  const ballHandlingPattern = /^\d+\.\s+(.+?):\s+(\d+)\s+(sec|reps)/gm;
  let match;

  while ((match = ballHandlingPattern.exec(warmupContent)) !== null) {
    const name = match[1].trim();
    const value = match[2];
    const unit = match[3];

    exercises.push({
      name: `Warm-up: ${name}`,
      order: order++,
      targetSets: 1,
      targetReps: `${value} ${unit}`,
      notes: 'Part of daily warm-up routine',
    });
  }

  // Parse shooting drills (format: 1. **Name**: 50 makes)
  const shootingPattern = /^\d+\.\s+\*\*(.+?)\*\*:\s*(\d+)\s*(makes?|attempts?)/gm;
  while ((match = shootingPattern.exec(warmupContent)) !== null) {
    const name = match[1].trim();
    const value = match[2];
    const unit = match[3];

    exercises.push({
      name: `[SHOOT] ${name}`,
      order: order++,
      targetSets: 1,
      targetReps: `${value} ${unit}`,
      notes: 'Shooting drill - warm-up',
    });
  }

  console.log(`Daily Warm-up: Found ${exercises.length} exercises`);

  return {
    name: 'DAILY WARM-UP',
    description: 'Complete warm-up routine - do before every training day',
    category: 'WARMUP',
    exercises,
  };
}

function parseAllExercisesFromDay(content: string, day: string): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  let order = 1;

  // 1. Parse gym exercises (numbered with asterisks)
  const gymExercises = parseGymExercises(content, order);
  exercises.push(...gymExercises);
  order += gymExercises.length;

  // 2. Parse ball handling drills
  const ballHandlingExercises = parseBallHandlingDrills(content, order, day);
  exercises.push(...ballHandlingExercises);
  order += ballHandlingExercises.length;

  // 3. Parse shooting drills
  const shootingExercises = parseShootingDrills(content, order, day);
  exercises.push(...shootingExercises);
  order += shootingExercises.length;

  // 4. Parse conditioning work
  const conditioningExercises = parseConditioningWork(content, order, day);
  exercises.push(...conditioningExercises);
  order += conditioningExercises.length;

  // 5. Parse core work
  const coreExercises = parseCoreWork(content, order);
  exercises.push(...coreExercises);

  return exercises;
}

function parseGymExercises(content: string, startOrder: number): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  let order = startOrder;

  // Pattern: 1. **Exercise Name** - 4 x 10-12
  const exercisePattern = /^(\d+)\.\s+\*\*(.+?)\*\*\s+-\s+(.+?)$/gm;

  let match;
  while ((match = exercisePattern.exec(content)) !== null) {
    const name = match[2].trim();
    const details = match[3].trim();

    // Get the full exercise block including notes
    const exerciseIndex = match.index;
    const nextExerciseMatch = /^\d+\.\s+\*\*/gm;
    nextExerciseMatch.lastIndex = exerciseIndex + match[0].length;
    const nextMatch = nextExerciseMatch.exec(content);
    const exerciseBlock = content.substring(exerciseIndex, nextMatch ? nextMatch.index : content.length);

    let targetSets = 3;
    let targetReps = '10';
    let targetWeight: string | null = null;

    // Pattern: "4 x 10-12" or "5 sets"
    const setsRepsMatch = details.match(/(\d+)\s*x\s*(\d+(?:-\d+)?)/i);
    if (setsRepsMatch) {
      targetSets = parseInt(setsRepsMatch[1]);
      targetReps = setsRepsMatch[2];
    } else {
      const setsOnlyMatch = details.match(/(\d+)\s*sets?/i);
      if (setsOnlyMatch) {
        targetSets = parseInt(setsOnlyMatch[1]);
        targetReps = '8-12';
      }
    }

    // Extract weight from exercise block
    // Patterns: "10kg dumbbells", "Start with 10kg", "Week 1-2: 20kg", "8-10kg", "15-20kg on cable", "15 reps (12-16kg)"
    const weightPatterns = [
      /\d+\s+reps?\s+\((\d+(?:-\d+)?)\s*kg\)/i, // "15 reps (12-16kg)" - check this first
      /\d+\s+each\s+arm\s+\((\d+(?:-\d+)?)\s*kg\)/i, // "10 each arm (10kg)"
      /(?:start with|week \d+-\d+:?)\s*(\d+(?:-\d+)?)\s*kg/i,
      /(\d+(?:-\d+)?)\s*kg\s+(?:dumbbells?|barbell|total|bar)/i,
      /(\d+(?:-\d+)?)\s*kg\s+(?:each hand|assistance|starting weight|on cable)/i,
      /(\d+(?:-\d+)?)\s*kg(?:\s+\(|$)/i, // Match "16kg" or "16kg ("
    ];

    for (const pattern of weightPatterns) {
      const weightMatch = exerciseBlock.match(pattern);
      if (weightMatch) {
        targetWeight = `${weightMatch[1]}kg`;
        break;
      }
    }

    exercises.push({
      name: `[GYM] ${name}`,
      order: order++,
      targetSets,
      targetReps,
      targetWeight: targetWeight || undefined,
    });
  }

  return exercises;
}

function parseBallHandlingDrills(content: string, startOrder: number, day: string): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  let order = startOrder;

  // Look for ball handling sections
  const ballHandlingSection = content.match(/### BALL HANDLING[\s\S]*?(?=###|$)/);
  if (!ballHandlingSection) return exercises;

  const section = ballHandlingSection[0];

  // Parse movement drills like "Speed dribble (right hand): 2 trips"
  const drillPattern = /^-?\s*(.+?):\s*(\d+)\s*(trips|sec|reps)/gm;
  let match;

  while ((match = drillPattern.exec(section)) !== null) {
    const drillName = match[1].trim();
    const value = match[2];
    const unit = match[3];

    exercises.push({
      name: `[BALL] ${drillName}`,
      order: order++,
      targetSets: 1,
      targetReps: `${value} ${unit}`,
      notes: 'Ball handling drill',
    });
  }

  // Parse numbered drills like "1. Speed dribble forward"
  const numberedDrillPattern = /^(\d+)\.\s+(.+?)$/gm;
  const drillContent = section.match(/\*\*(.+?)\*\*[\s\S]*?(?=\*\*|###|$)/g);

  if (drillContent) {
    drillContent.forEach((drill) => {
      const drillLines = drill.split('\n').filter((line) => line.match(/^\d+\./));
      drillLines.forEach((line) => {
        const lineMatch = line.match(/^(\d+)\.\s+(.+?)$/);
        if (lineMatch) {
          exercises.push({
            name: `[BALL] ${lineMatch[2].trim()}`,
            order: order++,
            targetSets: 1,
            targetReps: 'As prescribed',
            notes: 'Ball handling sequence',
          });
        }
      });
    });
  }

  return exercises;
}

function parseShootingDrills(content: string, startOrder: number, day: string): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  let order = startOrder;

  // Look for shooting sections
  const shootingSection = content.match(/### SHOOTING[\s\S]*?(?=###|$)/);
  if (!shootingSection) return exercises;

  const section = shootingSection[0];

  // Parse shooting drills like "Form shooting (5 feet): 50 makes"
  const shootingPattern = /^-?\s*\*?\*?(.+?):\s*(\d+)\s*(makes?|attempts?)/gmi;
  let match;

  while ((match = shootingPattern.exec(section)) !== null) {
    const drillName = match[1].trim().replace(/\*\*/g, '');
    const value = match[2];
    const unit = match[3];

    exercises.push({
      name: `[SHOOT] ${drillName}`,
      order: order++,
      targetSets: 1,
      targetReps: `${value} ${unit}`,
      notes: `Shooting drill - ${day}`,
    });
  }

  // Parse numbered shooting drills
  const numberedShootingPattern = /^(\d+)\.\s+\*\*(.+?)\*\*:\s*(\d+)\s*(makes?|attempts?)/gm;
  while ((match = numberedShootingPattern.exec(section)) !== null) {
    const drillName = match[2].trim();
    const value = match[3];
    const unit = match[4];

    exercises.push({
      name: `[SHOOT] ${drillName}`,
      order: order++,
      targetSets: 1,
      targetReps: `${value} ${unit}`,
      notes: `Shooting drill - ${day}`,
    });
  }

  return exercises;
}

function parseConditioningWork(content: string, startOrder: number, day: string): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  let order = startOrder;

  // Look for conditioning sections
  const conditioningPatterns = [
    /### (?:BASKETBALL )?(?:AEROBIC )?CONDITIONING[\s\S]*?(?=###|$)/i,
    /### (?:BASKETBALL )?(?:HIGH-INTENSITY )?INTERVALS[\s\S]*?(?=###|$)/i,
    /\*\*Block \d+[\s\S]*?(?=\*\*Block|\*\*|###|$)/g,
  ];

  conditioningPatterns.forEach((pattern) => {
    const sections = content.match(pattern);
    if (!sections) return;

    sections.forEach((section) => {
      // Parse work intervals like "Work: 45 sec"
      const intervalPattern = /(?:Work|Rest):\s*(\d+)\s*(sec|min)/gi;
      const intervals = Array.from(section.matchAll(intervalPattern));

      if (intervals.length > 0) {
        const title = section.match(/\*\*(.+?)\*\*/)?.[1] || 'Conditioning work';
        const work = intervals.find((m) => m[0].toLowerCase().includes('work'));
        const rest = intervals.find((m) => m[0].toLowerCase().includes('rest'));
        const rounds = section.match(/(\d+)\s*(?:rounds|reps|x)/i)?.[1] || '1';

        let repsInfo = '';
        if (work && rest) {
          repsInfo = `${work[1]}${work[2]} work, ${rest[1]}${rest[2]} rest, ${rounds} rounds`;
        } else if (work) {
          repsInfo = `${work[1]}${work[2]} × ${rounds}`;
        }

        if (repsInfo) {
          exercises.push({
            name: `[COND] ${title}`,
            order: order++,
            targetSets: 1,
            targetReps: repsInfo,
            notes: `Conditioning - ${day}`,
          });
        }
      }

      // Parse continuous work like "3 min continuous"
      const continuousPattern = /(\d+)\s*min\s+continuous/gi;
      const continuous = section.match(continuousPattern);
      if (continuous) {
        const title = section.match(/\*\*(.+?)\*\*/)?.[1] || 'Continuous movement';
        exercises.push({
          name: `[COND] ${title}`,
          order: order++,
          targetSets: 1,
          targetReps: continuous[0],
          notes: `Conditioning - ${day}`,
        });
      }
    });
  });

  return exercises;
}

function parseCoreWork(content: string, startOrder: number): ParsedExercise[] {
  const exercises: ParsedExercise[] = [];
  let order = startOrder;

  // Look for core/abs sections
  const coreSection = content.match(/### (?:CORE|ABS)[\s\S]*?(?=###|$)/i);
  if (!coreSection) return exercises;

  const section = coreSection[0];

  // Parse core exercises like "- Plank: 3 x 30-45 sec"
  const corePattern = /^-\s+(.+?):\s+(\d+)\s+x\s+(.+?)$/gm;
  let match;

  while ((match = corePattern.exec(section)) !== null) {
    const name = match[1].trim();
    const sets = match[2];
    const reps = match[3].trim();

    exercises.push({
      name: `[CORE] ${name}`,
      order: order++,
      targetSets: parseInt(sets),
      targetReps: reps,
      notes: 'Core work',
    });
  }

  return exercises;
}

async function main() {
  console.log('Starting seed...');

  // Read workout-routine.md
  const routineFile = path.join(process.cwd(), 'workout-routine.md');
  const markdown = fs.readFileSync(routineFile, 'utf-8');

  // Parse workout templates
  const templates = parseWorkoutRoutine(markdown);
  console.log(`Found ${templates.length} workout templates`);

  // Clear existing data
  await prisma.templateExercise.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.restTimerPreset.deleteMany();

  // Seed workout templates
  for (const template of templates) {
    const { exercises, ...templateData } = template;

    await prisma.workoutTemplate.create({
      data: {
        ...templateData,
        exercises: {
          create: exercises,
        },
      },
    });

    console.log(`Created template: ${template.name} with ${exercises.length} exercises`);
  }

  // Seed rest timer presets
  const timerPresets = [
    { name: '30 seconds', duration: 30, order: 1 },
    { name: '60 seconds', duration: 60, order: 2 },
    { name: '90 seconds', duration: 90, order: 3 },
    { name: '2 minutes', duration: 120, order: 4 },
    { name: '3 minutes', duration: 180, order: 5 },
  ];

  for (const preset of timerPresets) {
    await prisma.restTimerPreset.create({ data: preset });
  }

  console.log('Seeded rest timer presets');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
