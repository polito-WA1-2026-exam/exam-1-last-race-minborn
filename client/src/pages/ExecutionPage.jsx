import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function ExecutionPage({ executionResult }) {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();

  if (!executionResult) {
    return <Navigate to="/setup" replace />;
  }

  if (!executionResult.valid) {
    return (
      <section>
        <h1>Execution</h1>
        <p className="error">{executionResult.reason}</p>
        <p>Final score: 0</p>
        <button type="button" onClick={() => navigate("/result")}>
          Go to Result
        </button>
      </section>
    );
  }

  const steps = executionResult.steps;
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  function handleNextStep() {
    if (isLastStep) {
      navigate("/result");
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  return (
    <section>
      <h1>Execution</h1>
      <p>
        Step {stepIndex + 1} of {steps.length}
      </p>

      <div className="step-card">
        <p>
          From <strong>{currentStep.from}</strong> to{" "}
          <strong>{currentStep.to}</strong>
        </p>
        <p>Event: {currentStep.eventDescription}</p>
        <p>Effect: {currentStep.effect}</p>
        <p>Coins after this step: {currentStep.coinsAfter}</p>
      </div>

      <button type="button" onClick={handleNextStep}>
        {isLastStep ? "Go to Result" : "Next Step"}
      </button>
    </section>
  );
}

export default ExecutionPage;
