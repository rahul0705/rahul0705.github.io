declare module '@jsonresume/schema' {
  interface ResumeSchema {
    validate(resume: unknown, callback: (errors: unknown[] | null, valid: boolean) => void): void;
  }

  const resumeSchema: ResumeSchema;

  export default resumeSchema;
}
