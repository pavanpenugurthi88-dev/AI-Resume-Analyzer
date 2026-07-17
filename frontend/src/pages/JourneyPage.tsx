import ProcessWorkflow from '../components/ProcessWorkflow'

export default function JourneyPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12 relative">
        <div className="orb orb-primary top-0 left-1/2 -translate-x-1/2 w-64 h-64 opacity-20" />
        <h1 className="text-3xl md:text-5xl font-black text-dark-900 dark:text-white mb-4 tracking-tight relative z-10">
          Your Career <span className="gradient-text">Journey</span>
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto text-sm md:text-base font-medium relative z-10">
          From the moment you log in to the final mock interview, here is the complete 12-step path ResumeAI Pro uses to land you your dream job.
        </p>
      </div>

      <ProcessWorkflow />
    </div>
  )
}
