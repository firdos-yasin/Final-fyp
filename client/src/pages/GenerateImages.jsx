
import { Image, Sparkles, Wand2 } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {

  const [input, setInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const imageStyle = [
    'Realistic', 'Ghibli style', 'Anime style',
    'Cartoon style', 'Fantasy style', '3D style'
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `${input}, ${selectedStyle}`;
      const { data } = await axios.post(
        '/api/ai/generate-images',
        { prompt, publish },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setContent(data.image);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full p-6 flex gap-4 bg-gray-50'>

      {/* LEFT */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4'>

        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-[#00DA83] to-[#009BB3] flex items-center justify-center'>
            <Sparkles className='w-4 h-4 text-white'/>
          </div>
          <div>
            <h1 className='text-lg font-semibold text-slate-800'>AI Image Generator</h1>
            <p className='text-xs text-gray-400'>Turn your words into stunning visuals</p>
          </div>
        </div>

        <div className='h-px bg-gray-100'/>

        <div>
          <label className='text-sm font-medium text-slate-700'>Describe your image</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className='w-full mt-2 p-3 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 resize-none focus:border-[#00DA83] focus:ring-2 focus:ring-[#00DA83]/10 transition-all'
            placeholder='A beautiful sunset over mountains with golden light...'
            required
          />
        </div>

        {/* STYLE */}
        <div>
          <label className='text-sm font-medium text-slate-700'>Art Style</label>
          <div className='flex flex-wrap gap-2 mt-2'>
            {imageStyle.map((item) => (
              <span
                key={item}
                onClick={() => setSelectedStyle(item)}
                className={`px-3 py-1.5 text-xs rounded-full cursor-pointer border transition-all font-medium
                ${selectedStyle === item
                  ? 'bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white border-transparent shadow-sm'
                  : 'text-gray-500 border-gray-200 hover:border-[#00DA83] hover:text-[#00DA83]'}`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* PUBLIC */}
        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
          <input
            type='checkbox'
            id='publish'
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className='w-4 h-4 accent-[#00DA83] cursor-pointer'
          />
          <label htmlFor='publish' className='text-sm text-gray-600 cursor-pointer'>
            Make Public — share with community
          </label>
        </div>

        <button
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r
          from-[#00DA83] to-[#009BB3] text-white px-4 py-2.5 text-sm font-medium rounded-xl
          cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-70 shadow-sm'
        >
          {loading
            ? <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'/>
            : <Wand2 className='w-4 h-4'/>
          }
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

      </form>

      {/* RIGHT */}
      <div className='w-full max-w-lg bg-white p-6 border border-gray-100 rounded-2xl shadow-sm flex flex-col'>

        <div className='flex items-center gap-3 mb-4'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center'>
            <Image className='w-4 h-4 text-white'/>
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-800'>Generated Image</h2>
            <p className='text-xs text-gray-400'>Your creation will appear here</p>
          </div>
        </div>

        <div className='h-px bg-gray-100 mb-4'/>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center gap-4 text-gray-300 py-16'>
            <div className='w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center'>
              <Wand2 className='w-8 h-8 text-gray-300'/>
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-400'>No image generated yet</p>
              <p className='text-xs text-gray-300 mt-1'>Describe something and hit generate!</p>
            </div>
          </div>
        ) : (
          <div className='relative group'>
            <img
              src={content}
              alt="generated"
              className='w-full rounded-xl shadow-sm'
            />
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all'/>
          </div>
        )}

      </div>

    </div>
  )
}

export default GenerateImages;