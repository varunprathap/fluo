export default function About() {
  return (
    <div 
      className="text-gray-900 bg-white flex flex-col relative h-full justify-center items-center"
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      <main className="pt-20 pb-4 px-4 md:px-8 flex items-center justify-center relative z-10 w-full">
        {/* This div is centered by the main element above. max-w-4xl and w-full ensure responsiveness. */}
        <div className="max-w-4xl w-full flex items-center justify-center min-h-[60vh] mx-auto">
          <div
            className="relative p-6 sm:p-8 md:p-10 flex flex-col justify-center w-full bg-white/90 border border-gray-200 rounded-2xl shadow-sm"
            style={{
              overflow: 'hidden',
            }}
          >
            {/* Blurred background image */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: "url('/icons/about.svg')",
                backgroundSize: 'cover', // Reverted to 'cover' to ensure coverage
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(1px)',
                opacity: 0.2
              }}
              aria-hidden="true"
            />
            {/* Content */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6 relative z-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  The Future of Wage Compliance
                </h1>
                <p className="text-lg text-gray-600">
                  Built by compliance experts. Powered by AI.
                </p>
              </div>

              <div className="text-center mb-8 px-4">
                <p className="text-lg sm:text-xl text-gray-800 font-medium leading-relaxed max-w-3xl mx-auto">
                  Fluo is an AI-powered system for payroll governance, automating information gathering by connecting to multiple systems and enterprise clouds. It streamlines compliance, enhances efficiency, and helps firms scale and succeed.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">The Problem</h3>
                    <p className="text-sm text-gray-600">Data is scattered across enterprise systems and clouds, completely fragmented.</p>
                </div>
                
                <div className="text-center p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">The Reality</h3>
                  <p className="text-sm text-gray-600">Information everywhere. Knowledge nowhere.</p>
                </div>
                
                <div className="text-center p-6 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Solution</h3>
                  <p className="text-sm text-gray-600">AI-powered unified intelligence platform</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-gray-900 text-white rounded-full font-medium text-sm sm:text-base">
                  <span>Enterprise-grade</span>
                  <span className="text-gray-400">•</span>
                  <span>AI-powered</span>
                  <span className="text-gray-400">•</span>
                  <span>Compliance-first</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
