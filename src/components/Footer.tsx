export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              © 2025 PMS Cloud. All rights reserved.
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span className="text-sm">
              Developed by
            </span>
            <a
              href="mailto:ahmed.fathy@pms.eg"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Ahmed Fathy DevOPS
            </a>
            <span className="text-sm">
              (ahmed.fathy@pms.eg)
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
