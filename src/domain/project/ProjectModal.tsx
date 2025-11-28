type TaskInstructionsProps = {
  instructions: string[];
  images?: string[];
};

const TaskInstructions = ({ instructions, images }: TaskInstructionsProps) => {
  return (
    <>
      <ul>
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>
      {/* // TODO: améliorer le rendu avec un carousel si plusieurs images */}
      {images && images.length > 0 && (
        <div>
          {images.map((imageSrc, index) => (
            <img
              className="cmc-task-instruction__image"
              key={index}
              src={imageSrc}
              alt={`Instruction ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

const ProjectModal = {
  TaskInstructions,
};

export default ProjectModal;
