import { db } from '../db';
import { exams, examTemplates } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

async function backfillTemplateIds() {
    // Find the NCLEX template
    const nclexTemplate = await db.query.examTemplates.findFirst({
        where: eq(examTemplates.title, 'NCLEX-RN Practice Exam'),
    });

    if (!nclexTemplate) {
        console.log('NCLEX template not found');
        return;
    }

    console.log('Found NCLEX template:', nclexTemplate.id);

    // Update all NCLEX exams that don't have a templateId
    const result = await db.update(exams)
        .set({
            templateId: nclexTemplate.id,
            iconUrl: '/images/nursingicon(1).jpg'
        })
        .where(
            and(
                eq(exams.title, 'NCLEX-RN Practice Exam'),
                isNull(exams.templateId)
            )
        )
        .returning({ id: exams.id });

    console.log('Updated exams:', result.length);
    console.log(result);
}

backfillTemplateIds().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
