import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";

// PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const styles = `
.ai-generator-container{min-height:100vh;padding:40px;background:linear-gradient(135deg,#000,#1a1a1a);color:#fff}
.ai-generator-wrapper{max-width:1000px;margin:0 auto;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;padding:28px;border:2px solid #9d00ff}
.material-section{padding:18px;border:2px dashed #9d00ff;border-radius:10px;text-align:center;background:rgba(157,0,255,0.04)}
.upload-area{padding:18px;cursor:pointer}
.file-input{display:none}
.loading{display:flex;flex-direction:column;align-items:center;gap:10px;color:#9d00ff}
.generated-questions{margin-top:20px}
.question-card{background:rgba(255,255,255,0.03);padding:12px;border-radius:8px;margin-bottom:12px}
`;

export default function AIQuestionGenerator(){
  const navigate = useNavigate();
  const { index } = useParams();
  const quizIndex = parseInt(index);

  const quizzes = JSON.parse(localStorage.getItem("quizzes")||"[]");
  const quiz = quizzes[quizIndex];

  const [materialFile,setMaterialFile] = useState(null);
  const [fileName,setFileName] = useState("");
  const [isGenerating,setIsGenerating] = useState(false);
  const [generatedQuestions,setGeneratedQuestions] = useState([]);
  const [selectedQuestions,setSelectedQuestions] = useState([]);
  const [numQuestions,setNumQuestions] = useState(5);
  const [autoPublish,setAutoPublish] = useState(false);

  if(!quiz){
    return <div style={{padding:30,color:'white'}}>Quiz not found</div>;
  }

  // Extract text from PDF using pdfjs
  const extractTextFromPDF = async (file)=>{
    try{
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = "";
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item=>item.str).join(' ') + '\n';
      }
      return text;
    }catch(err){
      console.error('PDF parse error',err);
      return '';
    }
  };

  const generateMockQuestions = async (count,difficulty,sourceText="")=>{
    // Use sourceText to pick topics if available (simple heuristic)
    const bank = [
      {topic:'Photosynthesis',qs:[
        {text:'What is the main product of photosynthesis?',correct:'Glucose',distractors:['Oxygen','Carbon dioxide','ATP']},
        {text:'Where does photosynthesis occur?',correct:'Chloroplast',distractors:['Mitochondria','Nucleus','Ribosome']}
      ]},
      {topic:'Cell Biology',qs:[
        {text:'Which organelle is called the powerhouse of the cell?',correct:'Mitochondrion',distractors:['Chloroplast','Nucleus','Golgi apparatus']},
        {text:'Which process results in two identical daughter cells?',correct:'Mitosis',distractors:['Meiosis','Apoptosis','Binary fission']}
      ]},
      {topic:'Database',qs:[
        {text:'Which normal form removes partial dependencies?',correct:'Second Normal Form (2NF)',distractors:['1NF','3NF','BCNF']},
        {text:'What does ACID stand for?',correct:'Atomicity, Consistency, Isolation, Durability',distractors:['Accuracy,Consistency,Integrity,Durability','Availability,Consistency,Isolation,Durability','Atomicity,Concurrency,Isolation,Durability']}
      ]}
    ];

    // very simple topic selection from sourceText
    let pool = bank[Math.floor(Math.random()*bank.length)];
    if(sourceText && sourceText.toLowerCase().includes('photosynth')) pool = bank[0];
    if(sourceText && sourceText.toLowerCase().includes('mitochond')) pool = bank[1];
    if(sourceText && sourceText.toLowerCase().includes('database')) pool = bank[2];

    const questions = [];
    // If requested count > available templates, rotate and vary slightly
    for(let i=0;i<count;i++){
      const tpl = pool.qs[i % pool.qs.length];
      // create a small variation to avoid exact duplicates
      const variantSuffix = (i >= pool.qs.length) ? ` (v${Math.floor(i / pool.qs.length)})` : '';
      const text = tpl.text + variantSuffix;
      // shuffle options
      const opts = [tpl.correct,...tpl.distractors].sort(()=>Math.random()-0.5);
      const correctIndex = opts.findIndex(o=>o===tpl.correct);
      questions.push({id:Date.now()+i,text,options:opts,correctAnswer:correctIndex,points: difficulty==='easy'?1: difficulty==='medium'?2:3});
    }
    return questions;
  };

  const onFileSelected = async (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    if(!(file.type==='application/pdf' || file.type.startsWith('image/'))){
      alert('Please upload PDF or image');
      return;
    }

    setMaterialFile(file);
    setFileName(file.name);
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSelectedQuestions([]);

    let text = '';
    if(file.type==='application/pdf'){
      text = await extractTextFromPDF(file);
    }

    // generate mock questions (in production, send text to backend AI)
    const count = parseInt(numQuestions) || 5;
    const mocks = await generateMockQuestions(count,'medium',text);
    setGeneratedQuestions(mocks);
    setSelectedQuestions(mocks.map(q=>q.id)); // select all by default
    setIsGenerating(false);
  };

  const toggleSelect = (id)=>{
    setSelectedQuestions(prev => prev.includes(id)? prev.filter(x=>x!==id): [...prev,id]);
  };

  const approveSelected = ()=>{
    const toAdd = generatedQuestions.filter(q=>selectedQuestions.includes(q.id));
    if(toAdd.length===0){ alert('Select at least one question'); return; }

    const updated = {...quiz};
    if(!updated.questions) updated.questions=[];
    toAdd.forEach(q=>{
      updated.questions.push({id:(updated.questions.length||0)+1,questionText:q.text,options:q.options,correctAnswer:q.correctAnswer,points:q.points});
      updated.totalPoints = (updated.totalPoints||0)+q.points;
    });
    updated.materialFile = fileName;
    updated.aiGenerated = true;
    if (autoPublish) {
      updated.published = true;
      updated.status = 'published';
    }

    const all = [...quizzes];
    all[quizIndex] = updated;
    localStorage.setItem('quizzes',JSON.stringify(all));

    alert(`✅ ${toAdd.length} questions added`);
    navigate('/dashboard');
  };

  return (
    <div className="ai-generator-container">
      <style>{styles}</style>
      <div className="ai-generator-wrapper">
        <h2 style={{color:'#ff00ff'}}>🤖 AI Question Generator</h2>

        <div className="material-section">
          <div style={{marginBottom:12}}>Upload PDF or image — questions will be generated automatically.</div>
          <label className="upload-area">
            <input className="file-input" type="file" accept="application/pdf,image/*" onChange={onFileSelected} />
            <div style={{color:'#ccc'}}>{fileName || 'Click to choose file or drag-and-drop'}</div>
          </label>

          <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:12,flexWrap:'wrap'}}>
            <label style={{color:'#ccc',display:'flex',alignItems:'center',gap:8}}>
              Number of questions:
              <input type="number" min="1" max="20" value={numQuestions} onChange={(e)=>setNumQuestions(e.target.value)} style={{width:80,padding:6,borderRadius:6,border:'1px solid #9d00ff',background:'transparent',color:'#fff'}} />
            </label>

            <label style={{color:'#ccc',display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={autoPublish} onChange={(e)=>setAutoPublish(e.target.checked)} />
              <span style={{fontSize:13,color:'#aaa'}}>Publish quiz after adding</span>
            </label>
          </div>

          {isGenerating && (
            <div className="loading">
              <div style={{width:40,height:40,border:'4px solid rgba(157,0,255,0.3)',borderTop:'4px solid #9d00ff',borderRadius:20,animation:'spin 1s linear infinite'}} />
              <div>Reading material and generating questions…</div>
            </div>
          )}
        </div>

        <div className="generated-questions">
          {generatedQuestions.length>0 && (
            <>
              <h3 style={{color:'#9d00ff'}}>Generated Questions</h3>
              {generatedQuestions.map(q=> (
                <div key={q.id} className="question-card">
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <div style={{fontWeight:700}}>{q.text}</div>
                    <div>
                      <label style={{display:'flex',alignItems:'center',gap:8}}>
                        <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={()=>toggleSelect(q.id)} />
                        <span style={{fontSize:12,color:'#aaa'}}>Include</span>
                      </label>
                    </div>
                  </div>
                  <div style={{marginTop:8}}>
                    {q.options.map((opt,oi)=> (
                      <div key={oi} style={{padding:'6px 8px',background: oi===q.correctAnswer? 'rgba(0,255,153,0.08)':'transparent',borderRadius:6,marginBottom:6}}>
                        <strong style={{marginRight:8}}>{String.fromCharCode(65+oi)})</strong>{opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:12}}>
                <button className="btn-submit" onClick={approveSelected} style={{padding:'10px 18px',background:'linear-gradient(135deg,#9d00ff,#ff00ff)',border:'none',borderRadius:8,color:'#fff'}}>Add Selected to Quiz</button>
                <button className="btn-cancel" onClick={()=>{setGeneratedQuestions([]);setSelectedQuestions([]);setFileName('');setMaterialFile(null);}}>Clear</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
