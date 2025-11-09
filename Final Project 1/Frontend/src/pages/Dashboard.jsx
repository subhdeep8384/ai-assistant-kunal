import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Brain, Image as ImageIcon, Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const [summary , setSummary] = useState("")
  const { user, token } = useAuth(); 
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [stats, setStats] = useState({
    uploads: 0,
    summaries: 0,
    quizzes: 0,
    images: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/summary/stats', {
        headers: { Authorization: token },
      });
      setStats({
        uploads: res.data.totalUploads || 0,
        summaries: res.data.totalSummaries || 0,
        quizzes: res.data.totalQuizzes || 0,
        images: res.data.totalImages || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const  handleGenerate = async (type, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await axios.post('http://localhost:4000/api/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });

      const fileId = uploadRes.data.data.id;
      
    

      if (type === 'summary') {
        const res = await axios.get(
          `http://localhost:4000/api/file/${fileId}`,
          { fileId },
          { headers: { Authorization: token } }
        );
        const dataToGiveGemini = res.data.text; ;
       const summary = await axios.post(`http://localhost:4000/api/ai/summary`, {
        headers: { Authorization: token },
        fileId ,
        data: dataToGiveGemini,
       })
       console.log(summary)
       setSummary(summary.data.summary)

      } else if (type === 'quiz') {
        await axios.post(
          '/api/quizzes',
          { fileId },
          { headers: { Authorization: token } }
        );
      } else if (type === 'both') {
        await axios.post(
          '/api/ai/summary',
          { fileId },
          { headers: { Authorization: token } }
        );
        await axios.post(
          '/api/quizzes',
          { fileId },
          { headers: { Authorization: token } }
        );
      }

      fetchStats();
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/gemini/ask',
        { prompt: imagePrompt },
        { headers: { Authorization: token } }
      );

      setGeneratedImages(res.data.images || []);
      fetchStats();
    } catch (err) {
      console.error('Image generation error:', err);
      alert('Failed to generate image.');
    } finally {
      setLoading(false);
    }
  };

  const statList = [
    { label: 'Uploads', value: stats.uploads, icon: Upload, color: 'bg-pink-100 text-pink-600' },
    { label: 'Summaries', value: stats.summaries, icon: FileText, color: 'bg-purple-100 text-purple-600' },
    { label: 'Quizzes', value: stats.quizzes, icon: Brain, color: 'bg-pink-100 text-pink-600' },
    { label: 'Images', value: stats.images, icon: ImageIcon, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Welcome, {user?.name} 👋</h1>
          <p className="text-gray-600">Let's make learning easier and more fun today!</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statList.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-700">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <FileUpload onGenerate={handleGenerate} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6"
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-4">AI Image Generator</h3>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="flex-1 px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
              <button
                onClick={handleGenerateImage}
                disabled={loading}
                className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-500 hover:to-purple-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>

            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
                  >
                    <img src={img} alt={`Generated ${idx + 1}`} className="w-full h-48 object-cover" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-purple-50/50 rounded-xl p-12 text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400">Generated images will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
