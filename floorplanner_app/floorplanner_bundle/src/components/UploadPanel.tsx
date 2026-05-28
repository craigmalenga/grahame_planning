import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';

export function UploadPanel() {
  const { setFloorPlan, setViewMode, setUploadedImageUrl, setIsProcessing, isProcessing } = useStore();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setIsProcessing(true);

    try {
      // Upload the file
      const { url } = await api.uploadImage(file);
      setUploadedImageUrl(url);

      // Process the floor plan image to extract walls
      const processed = await api.processFloorPlan(url);

      setFloorPlan({
        name: file.name.replace(/\.[^.]+$/, ''),
        originalImageUrl: url,
        ...processed,
      });

      setViewMode('3d-view');
    } catch (err: any) {
      setError(err.message || 'Failed to process floor plan');
    } finally {
      setIsProcessing(false);
    }
  }, [setFloorPlan, setViewMode, setUploadedImageUrl, setIsProcessing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const loadDemo = () => {
    // Create a demo floor plan with a simple L-shaped layout
    const demoFloorPlan = {
      name: 'Demo Floor Plan',
      originalImageUrl: '',
      width: 800,
      height: 600,
      scale: 53,
      rooms: [
        {
          name: 'Living Room',
          walls: [
            { x1: 0, y1: 0, x2: 6, y2: 0, thickness: 0.15 },
            { x1: 6, y1: 0, x2: 6, y2: 5, thickness: 0.15 },
            { x1: 6, y1: 5, x2: 0, y2: 5, thickness: 0.15 },
            { x1: 0, y1: 5, x2: 0, y2: 0, thickness: 0.15 },
          ],
          bounds: { minX: 0, minY: 0, maxX: 6, maxY: 5 },
          center: { x: 3, y: 2.5 },
          ceilingHeight: 2.8,
          wallTexture: 'plaster-white',
          floorTexture: 'hardwood-oak',
          ceilingTexture: 'plaster-white',
        },
        {
          name: 'Kitchen',
          walls: [
            { x1: 6, y1: 0, x2: 10, y2: 0, thickness: 0.15 },
            { x1: 10, y1: 0, x2: 10, y2: 5, thickness: 0.15 },
            { x1: 10, y1: 5, x2: 6, y2: 5, thickness: 0.15 },
            { x1: 6, y1: 5, x2: 6, y2: 0, thickness: 0.15 },
          ],
          bounds: { minX: 6, minY: 0, maxX: 10, maxY: 5 },
          center: { x: 8, y: 2.5 },
          ceilingHeight: 2.8,
          wallTexture: 'plaster-white',
          floorTexture: 'tile-grey',
          ceilingTexture: 'plaster-white',
        },
        {
          name: 'Bedroom',
          walls: [
            { x1: 0, y1: 5, x2: 5, y2: 5, thickness: 0.15 },
            { x1: 5, y1: 5, x2: 5, y2: 9, thickness: 0.15 },
            { x1: 5, y1: 9, x2: 0, y2: 9, thickness: 0.15 },
            { x1: 0, y1: 9, x2: 0, y2: 5, thickness: 0.15 },
          ],
          bounds: { minX: 0, minY: 5, maxX: 5, maxY: 9 },
          center: { x: 2.5, y: 7 },
          ceilingHeight: 2.7,
          wallTexture: 'plaster-grey',
          floorTexture: 'carpet-beige',
          ceilingTexture: 'plaster-white',
        },
        {
          name: 'Bathroom',
          walls: [
            { x1: 5, y1: 5, x2: 10, y2: 5, thickness: 0.15 },
            { x1: 10, y1: 5, x2: 10, y2: 9, thickness: 0.15 },
            { x1: 10, y1: 9, x2: 5, y2: 9, thickness: 0.15 },
            { x1: 5, y1: 9, x2: 5, y2: 5, thickness: 0.15 },
          ],
          bounds: { minX: 5, minY: 5, maxX: 10, maxY: 9 },
          center: { x: 7.5, y: 7 },
          ceilingHeight: 2.5,
          wallTexture: 'tile-grey',
          floorTexture: 'marble-white',
          ceilingTexture: 'plaster-white',
        },
      ],
      wallSegments: [],
    };

    setFloorPlan(demoFloorPlan);
    setViewMode('design');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-2xl w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            FloorVision <span className="text-brand-600">3D</span>
          </h1>
          <p className="text-lg text-gray-500">
            Upload a floor plan image and walk through it in 3D
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
            ${isDragActive
              ? 'border-brand-500 bg-brand-50 scale-[1.02]'
              : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
            }
            ${isProcessing ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input {...getInputProps()} />

          {isProcessing ? (
            <div className="space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
              <p className="text-lg font-medium text-gray-700">Processing floor plan...</p>
              <p className="text-sm text-gray-500">Detecting walls and rooms from image</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-5xl">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop your floor plan here' : 'Drag & drop a floor plan image'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse — PNG, JPG, WebP up to 50MB</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={loadDemo}
            className="text-brand-600 hover:text-brand-700 font-medium text-sm underline underline-offset-2"
          >
            Try with a demo floor plan instead
          </button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">
              <svg className="mx-auto h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Upload</h3>
            <p className="text-xs text-gray-500 mt-1">Drop in your floor plan image</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">
              <svg className="mx-auto h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Convert to 3D</h3>
            <p className="text-xs text-gray-500 mt-1">Walls detected automatically</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">
              <svg className="mx-auto h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Walk Through</h3>
            <p className="text-xs text-gray-500 mt-1">Explore in first person</p>
          </div>
        </div>
      </div>
    </div>
  );
}
