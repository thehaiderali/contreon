import PostCreate from "../posts/PostCreate";

const FirstPostStep = ({ onNext }) => {
  return (
    <div>
      <h2>First Post Step</h2>
      <PostCreate/>
      <button onClick={onNext}>Next</button>
    </div>
  );
};
export default FirstPostStep;