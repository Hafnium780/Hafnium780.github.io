// Automatically pairs tutees based on ?
const autoPair = () => {
  // Array of {letter grade, tutee id, subject}s needed to be paired
  const toPair = [];

  for (const t of tutees) {
    const unmatched = getUnmatchedSubjects(t);
    for (let i = 0; i < t.subjects.length; i++) {
      if (!unmatched.includes(t.subjects[i])) continue;
      let grade = i < 5 ? t.grades[i] : "";
      if (grade == "") grade = "C";
      toPair.push({ grade: grade, id: t.id, subject: t.subjects[i] });
    }
  }

  toPair.sort((a, b) => {
    if (a.grade > b.grade) return -1;
    if (a.grade < b.grade) return 1;
    return 0;
  });

  for (const tp of toPair) {
    const validTutors = getValidTutorsForSubject(tp.id, tp.subject);
    if (validTutors.length == 0) continue;

    for (let i = 0; i < validTutors.length; i++) {
      validTutors[i] = {
        id: validTutors[i],
        mutuals: getMutualSubjectsID(tp.id, validTutors[i]).length,
        matches: getTimesMatched(validTutors[i]),
      };
    }

    validTutors.sort((a, b) => {
      if (a.mutuals > b.mutuals) return -1;
      if (a.mutuals < b.mutuals) return 1;

      if (a.matches < b.matches) return -1;
      if (a.matches > b.matches) return 1;
      return 0;
    });

    for (const tutor of validTutors) {
      const selectedTutor = getTutorByID(tutor.id);
      if (getMutualTimesID(tp.id, selectedTutor.id).length == 0) continue;

      const mutualSubjects = getMutualSubjectsID(tp.id, selectedTutor.id);

      // probably a way to avoid this but id rather not
      if (mutualSubjects.length == 0) continue;

      addPairingSubjectTime(tp.id, selectedTutor.id, mutualSubjects, [
        getMutualTimesID(tp.id, selectedTutor.id)[0],
      ]);
      break;
    }
  }
  refresh();
};
