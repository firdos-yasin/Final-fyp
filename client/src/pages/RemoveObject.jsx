/*
import { Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const RemoveObject = () => {

  const [input, setInput] = useState('')
  const [object, setObject] = useState('')

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();
      
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (object.trim().split(' ').length > 1) {
        setLoading(false);
        return toast('Please enter only one object name')
      }

      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object)

      const { data } = await axios.post(
        '/api/ai/remove-object',
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap 
    gap-4 text-slate-700'>
      {/* left column
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>

        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]'/>
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload image</p>

        <input onChange={(e) => setInput(e.target.files[0])} type='file' accept='image/*' className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
        border border-gray-300 text-gray-600' required/>

        <p className='mt-6 text-sm font-medium'>Describe object name to remove</p>

        <textarea onChange={(e) => setObject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md
        border border-gray-300' placeholder='e.g., watch or spoon, only single object name' required/>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r
        from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          {
            loading 
              ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              : <Scissors className='w-5'/>
          }
          Remove Object
        </button>
      </form>

      {/* Right column*
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border
      border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#4A7AFF]'/>
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {
          !content ?
          (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                <Scissors className='w-9 h-9'/>
                <p>Upload an image and click "Remove Object" to get started</p>
              </div>
            </div>
          )
          :
          (
            <img src={content} alt='processed' className='mt-3 w-full h-full'/>
          )
        }
      </div>
    </div>
  )
}

export default RemoveObject
*/
import { Scissors, Sparkles, Eraser, RotateCcw } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);

  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const imageRef = useRef(null);

  const { getToken } = useAuth();

  // Image upload hone pe canvas pe show karo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInput(file);
    setContent('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Image load hone pe canvas setup karo
  useEffect(() => {
    if (!imagePreview) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Mask canvas ko black se fill karo
      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    };
    img.src = imagePreview;
  }, [imagePreview]);

  // Drawing functions
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const pos = getPos(e, canvas);

    // Main canvas pe red highlight dikhao
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.fill();

    // Mask canvas pe white paint karo
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.beginPath();
    maskCtx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
    maskCtx.fillStyle = 'white';
    maskCtx.fill();
  };

  const stopDrawing = () => setIsDrawing(false);

  // Canvas reset karo
  const resetCanvas = () => {
    if (!imagePreview) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    };
    img.src = imagePreview;
  };

  // Submit handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) return toast.error('Please upload an image');

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    // Check karo kuch draw kiya ya nahi
    const maskCtx = maskCanvas.getContext('2d');
    const pixelData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    const hasWhite = Array.from(pixelData).some((val, i) => i % 4 === 0 && val > 200);
    if (!hasWhite) return toast.error('Please mark the object you want to remove');

    try {
      setLoading(true);

      // Mask canvas ko blob mein convert karo
      const maskBlob = await new Promise((resolve) => {
        maskCanvas.toBlob(resolve, 'image/png');
      });

      const formData = new FormData();
      formData.append('image', input);
      formData.append('mask', maskBlob, 'mask.png');

      const { data } = await axios.post(
        '/api/ai/remove-object',
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

      {/* Left column */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>

        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload image</p>
        <input
          onChange={handleImageChange}
          type='file'
          accept='image/*'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
        />

        {/* Canvas - image upload hone pe show hoga */}
        {imagePreview && (
          <div className='mt-4'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium'>Mark object to remove</p>
              <button
                type='button'
                onClick={resetCanvas}
                className='flex items-center gap-1 text-xs text-gray-500 hover:text-red-500'
              >
                <RotateCcw className='w-3 h-3' /> Reset
              </button>
            </div>

            <p className='text-xs text-gray-400 mb-2'>Paint over the object you want to remove</p>

            {/* Brush size */}
            <div className='flex items-center gap-2 mb-2'>
              <Eraser className='w-4 h-4 text-gray-500' />
              <input
                type='range'
                min='5'
                max='50'
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className='w-32'
              />
              <span className='text-xs text-gray-500'>{brushSize}px</span>
            </div>

            {/* Canvas */}
            <div className='relative border border-gray-300 rounded-md overflow-hidden cursor-crosshair'>
              <canvas
                ref={canvasRef}
                className='w-full'
                onMouseDown={startDrawing}
                onMouseMove={(e) => isDrawing && draw(e)}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={(e) => isDrawing && draw(e)}
                onTouchEnd={stopDrawing}
              />
              {/* Hidden mask canvas */}
              <canvas ref={maskCanvasRef} className='hidden' />
            </div>
          </div>
        )}

        <button
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
        >
          {loading
            ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            : <Scissors className='w-5' />
          }
          Remove Object
        </button>
      </form>

      {/* Right column */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>
        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image, mark the object, and click "Remove Object"</p>
            </div>
          </div>
        ) : (
          <img src={content} alt='processed' className='mt-3 w-full h-full' />
        )}
      </div>
    </div>
  );
};

export default RemoveObject;