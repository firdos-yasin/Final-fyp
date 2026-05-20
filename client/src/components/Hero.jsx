import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Sparkles, Zap, Image, FileText } from 'lucide-react'

const Hero = () => {

    const navigate = useNavigate()

  return (
    
    <div className='px-4 sm:px-20 xl:px-32 relative flex flex-col w-full justify-center 
    items-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>

        {/* Grid pattern overlay */}
        <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]'/>

        {/* Glow effects */}
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl'/>
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl'/>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl'/>

        {/* Floating feature cards */}
        <div className='absolute top-24 left-8 hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white text-xs animate-bounce' style={{animationDuration: '3s'}}>
            <Image className='w-4 h-4 text-cyan-400'/>
            <span className='text-white/70'>Image generated</span>
            <span className='w-2 h-2 bg-green-400 rounded-full'/>
        </div>

        <div className='absolute top-40 right-8 hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white text-xs animate-bounce' style={{animationDuration: '4s', animationDelay: '1s'}}>
            <FileText className='w-4 h-4 text-violet-400'/>
            <span className='text-white/70'>Article written</span>
            <span className='w-2 h-2 bg-green-400 rounded-full'/>
        </div>

        <div className='absolute bottom-32 left-12 hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white text-xs animate-bounce' style={{animationDuration: '3.5s', animationDelay: '0.5s'}}>
            <Zap className='w-4 h-4 text-yellow-400'/>
            <span className='text-white/70'>Resume reviewed</span>
            <span className='w-2 h-2 bg-green-400 rounded-full'/>
        </div>

        <div className='text-center mb-8 relative z-10'>

            {/* Badge */}
            <div className='inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15
            rounded-full px-4 py-2 text-xs text-white/70 font-medium mb-8'>
                <div className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse'/>
                Next-Generation AI Platform
                <Sparkles className='w-3 h-3 text-violet-400'/>
            </div>

            <h1 className='text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl
            font-bold mx-auto leading-[1.15] text-white mb-6'>
                Create amazing<br/>
                content with{' '}
                <span className='bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent'>
                    AI tools
                </span>
            </h1>

            <p className='max-w-md mx-auto text-white/50 leading-relaxed text-base'>
                Transform your content creation with our suite of premium AI tools.
                Write articles, generate images, and enhance your workflow.
            </p>
        </div>

        {/* Single centered button */}
        <div className='relative z-10'>
            <button
                onClick={() => navigate('/ai')}
                className='flex items-center gap-2 bg-white text-slate-900
                px-10 py-3.5 rounded-xl hover:scale-105 hover:bg-gray-100
                active:scale-95 transition-all duration-200 cursor-pointer font-semibold 
                shadow-lg shadow-white/10'
            >
                <Sparkles className='w-4 h-4 text-violet-600'/>
                Start creating now
            </button>
        </div>

        {/* Stats */}
        <div className='flex items-center gap-8 mt-12 relative z-10'>
            <div className='text-center'>
                <p className='text-white font-bold text-xl'>10k+</p>
                <p className='text-white/40 text-xs mt-1'>Users</p>
            </div>
            <div className='w-px h-8 bg-white/10'/>
            <div className='text-center'>
                <p className='text-white font-bold text-xl'>50k+</p>
                <p className='text-white/40 text-xs mt-1'>Creations</p>
            </div>
            <div className='w-px h-8 bg-white/10'/>
            <div className='flex items-center gap-2'>
                <img src={assets.user_group} alt="" className='h-7 opacity-80'/>
                <p className='text-white/50 text-xs'>Trusted worldwide</p>
            </div>
        </div>

        {/* Bottom fade */}
        <div className='absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent'/>

    </div>
  )
}

export default Hero