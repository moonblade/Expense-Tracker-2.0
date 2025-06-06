import React, { useState } from 'react';

function escapeRegex(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
}

function TokenSelector({ tokens, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {tokens.map((token, index) => (
        <button
          key={index}
          className={`px-2 py-1 rounded border-2 whitespace-nowrap
            ${token.type === 'static' ? 'border-gray-300 bg-gray-200' :
              token.type === 'amount' ? 'border-green-600 bg-green-300' :
              token.type === 'merchant' ? 'border-blue-600 bg-blue-300' :
              'border-yellow-600 bg-yellow-300'}`}
          onClick={() => onSelect(index)}
        >
          {token.text}
        </button>
      ))}
    </div>
  );
}

export default function PatternCreator() {
  const [input, setInput] = useState('');
  const [tokens, setTokens] = useState([]);
  const [step, setStep] = useState('input');
  const [testMessage, setTestMessage] = useState('');

  const tokenize = (str) => {
    return str
      .match(/[^\s]+/g)
      .map((t) => ({ text: t, type: 'static' }));
  };

  const handleStart = () => {
    setTokens(tokenize(input));
    setStep('amount');
  };

  const handleSelect = (index) => {
    const newTokens = [...tokens];
    const currentType = step === 'amount' ? 'amount' : step === 'merchant' ? 'merchant' : 'wildcard';

    if (newTokens[index].type === currentType) {
      newTokens[index].type = 'static';
    } else {
      newTokens[index].type = currentType;
    }

    setTokens(newTokens);
  };

  const handleNextStep = () => {
    if (step === 'amount') setStep('merchant');
    else if (step === 'merchant') setStep('wildcards');
  };

  const buildRegex = () => {
    const grouped = groupTokensByType();
    return grouped
      .map((t) => {
        if (t.type === 'amount') return '(?P<amount>.*?)';
        if (t.type === 'merchant') return '(?P<merchant>.*?)';
        if (t.type === 'wildcard') return '.*?';
        return escapeRegex(t.text);
      })
      .join(' ');
  };

  const groupTokensByType = () => {
    const result = [];
    let currentGroup = { text: '', type: null };

    for (const token of tokens) {
      if (token.type === currentGroup.type) {
        currentGroup.text += ' ' + token.text;
      } else {
        if (currentGroup.type !== null) result.push({ ...currentGroup });
        currentGroup = { text: token.text, type: token.type };
      }
    }
    if (currentGroup.type !== null) result.push({ ...currentGroup });
    return result;
  };

  const runRegexTest = () => {
    try {
      const regex = new RegExp(buildRegex().replace(/\\/g, '\\\\'));
      const match = testMessage.match(regex);
      return match?.groups || null;
    } catch (err) {
      return { error: err.message };
    }
  };

  const testResult = runRegexTest();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Regex Builder for Spend Messages</h1>

      {step === 'input' && (
        <div>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={4}
            placeholder="Paste your message here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleStart}>
            Start
          </button>
        </div>
      )}

      {step !== 'input' && (
        <>
          <p className="mb-1 font-semibold">
            {step === 'amount' && 'Select the amount in the message'}
            {step === 'merchant' && 'Select the merchant (may be multiple words)'}
            {step === 'wildcards' && 'Select any other parts that may change (optional)'}
          </p>
          <TokenSelector tokens={tokens} onSelect={handleSelect} />

          <div className="flex gap-2 mt-2">
            {(step === 'merchant' || step === 'wildcards') && (
              <button
                className="bg-gray-300 text-black px-4 py-1 rounded"
                onClick={() => setStep(step === 'merchant' ? 'amount' : 'merchant')}
              >
                Back
              </button>
            )}
            {(step === 'amount' || step === 'merchant') && (
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={handleNextStep}
              >
                Next
              </button>
            )}
            <button
              className="bg-yellow-500 text-white px-4 py-1 rounded"
              onClick={() => setStep('input')}
            >
              Edit Message
            </button>
          </div>

          {step === 'wildcards' && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-semibold">Generated Regex:</p>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {buildRegex()}
                </pre>
              </div>

              <div>
                <p className="font-semibold">Test Regex on Sample Message:</p>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={2}
                  placeholder="Paste a sample message here"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {testMessage && testResult ? JSON.stringify(testResult, null, 2) : 'No match'}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
