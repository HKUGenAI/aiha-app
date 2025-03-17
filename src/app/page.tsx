import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">AIHA</h1>
      <h2 className="text-2xl mb-6">AI Historian Assistant</h2>
      
      <p className="max-w-2xl mb-8 text-gray-600">
        Helping researchers analyze and understand multimodal historical materials through AI.
        This site is currently under development.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link 
          href="https://github.com/HKUGenAI/aiha-app"
          className="rounded-md bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Repository
        </Link>
        <Link
          href="/projects"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Existing Projects
        </Link>
      </div>
      
      <p className="text-sm text-gray-500">
        Developed by the <a href="mailto:innowing-genai@hku.hk" className="text-blue-600 hover:underline">HKU InnoWing GenAI Team</a>
      </p>
    </div>
  );
}
