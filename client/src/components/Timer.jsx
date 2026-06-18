function Timer({ secondsLeft }) {
  return (
    <p className="timer">
      Time left: <strong>{secondsLeft}</strong> seconds
    </p>
  );
}

export default Timer;
