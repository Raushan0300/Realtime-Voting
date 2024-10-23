import axios from "axios"
import { useEffect, useState } from "react"
import socket from "./socket";

function App() {
  const [votes, setVotes] = useState<any>([]);
  const [newVote, setNewVote] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");

  useEffect(()=>{
    const fetchData = async()=>{
      const response = await axios.get('http://localhost:8000/getVotes');
      setVotes(response.data);
    };

    fetchData();
  },[]);

  useEffect(()=>{
    const handleAnswerOutput = ({id, answer}: any) => {
      setVotes((prevVotes: any) => 
        prevVotes.map((vote: any) => 
          vote._id === id ? {
            ...vote,
            yes: answer === 1 ? vote.yes + 1 : vote.yes,
            no: answer === 0 ? vote.no + 1 : vote.no,
          } : vote
        )
      );
    };

    socket.on('answer:output', handleAnswerOutput);

    return () => {
      socket.off('answer:output', handleAnswerOutput);
    };
  }, [votes, socket]);

  const handleAnswerInput = (id:any, answer:any) => {
    socket.emit('answer:input',{id, answer});
  };

  const handleAddVote = async()=>{
    await axios.post('http://localhost:8000/new-vote', {question});
    setNewVote(false)
  }
  
  return (
    <div className="flex flex-col px-6 mt-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vote Polling</h1>
        <button className="bg-blue-500 px-4 py-2 text-white rounded-lg" onClick={()=>{setNewVote(!newVote)}}>New Vote</button>
      </div>
      {newVote && (
        <div className="flex flex-col justify-center items-center gap-2">
          <input type="text" className="px-4 py-2 border border-gray-300 rounded" placeholder="Enter Question" value={question} onChange={(e)=>{setQuestion(e.target.value)}} />
          <button className="bg-blue-500 px-4 py-2 text-white rounded-lg" onClick={handleAddVote}>Add Vote</button>
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-2 mt-10">
        {votes.map((vote: any, index:any)=>{
          const totalVote = vote.yes + vote.no;
          const yesPercent = totalVote ? (vote.yes * 100) / totalVote : 0;
          const noPercent = totalVote ? (vote.no * 100) / totalVote : 0;
          return(
            <div className="flex flex-col px-4 py-2 border border-gray-400 gap-2 w-[500px] rounded-lg" key={index}>
              <h1>Q: {vote.question}</h1>
              <div className={`relative flex justify-between items-center border border-gray-300 rounded-lg cursor-pointer`} onClick={()=>{handleAnswerInput(vote._id, 1)}}>
                <div className="absolute left-0 top-0 bg-blue-100 h-full" style={{width: `${yesPercent}%`}}></div>
                <p className="relative z-10 px-2 py-2">Yes</p>
                <p className="relative z-10 px-2 py-2">{vote.yes}</p>
              </div>
              <div className="relative flex justify-between items-center border border-gray-300 rounded-lg cursor-pointer" onClick={()=>{handleAnswerInput(vote._id, 0)}}>
              <div className="absolute left-0 top-0 bg-blue-100 h-full" style={{width: `${noPercent}%`}}></div>
                <p className="relative z-10 px-2 py-2">No</p>
                <p className="relative z-10 px-2 py-2">{vote.no}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
