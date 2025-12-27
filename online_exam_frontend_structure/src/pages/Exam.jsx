
import questions from '../data/questions.json'

export default function Exam() {
  return (
    <div>
      <h1>Demo Exam</h1>
      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question}</p>
          {q.options.map(o => <div key={o}>{o}</div>)}
        </div>
      ))}
    </div>
  )
}
