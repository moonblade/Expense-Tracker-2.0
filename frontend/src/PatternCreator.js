import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

function escapeRegex(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
}

function TokenSelector({ tokens, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {tokens.map((token, index) => {
        if (token.type === 'space') return null;
        return (
        <Button
          key={index}
          // variant="outlined"
          color={token.type === 'static' ? 'default' :
                 token.type === 'amount' ? 'success' :
                 token.type === 'merchant' ? 'primary' :
                 'warning'}
          onClick={() => onSelect(index)}
          style={{ minWidth: '0', py: '0', textTransform: 'none' }}
        >
          {token.text}
        </Button> 
        )
      })}
    </div>
  );
}

export default function PatternCreator({input, approve, updatePattern}) {
  const [step, setStep] = useState('amount');

  const tokenize = (str) => {
    const regex = /[^\s,.\-]+|[\s,.\-]/g;
    const matches = str.match(regex) || [];

    return matches.map((t) => ({
      text: t,
      type: /[\s,.\-]/.test(t) ? /[\s]/.test(t) ? 'space' : 'delim' : 'static',
    }));
  };

  useEffect(() => {
    if (approve) {
      setStep('amount');
    }
    else {
      setStep('wildcards');
    }
    setTokens(tokenize(input));
  }, [input, approve]);


  const [tokens, setTokens] = useState(tokenize(input));

  const handleSelect = (index) => {
    const newTokens = [...tokens];
    const currentType = step === 'amount' ? 'amount' : step === 'merchant' ? 'merchant' : 'wildcard';

    if (currentType === 'amount') {
      // Only one amount allowed
      newTokens.forEach((t, i) => {
        if (t.type === 'amount') newTokens[i].type = 'static';
      });
      newTokens[index].type = newTokens[index].type === 'amount' ? 'static' : 'amount';
    }

    else if (currentType === 'merchant') {
      const isMerchant = (i) => newTokens[i] && newTokens[i].type === 'merchant';
      const isSpace = (i) => newTokens[i] && newTokens[i].type === 'space';

      // Find all merchant indices
      const merchantIndices = newTokens.map((t, i) => t.type === 'merchant' ? i : -1).filter(i => i !== -1);

      const isAdjacentIgnoringSpaces = (targetIdx) => {
        return merchantIndices.some(i => {
          let min = Math.min(i, targetIdx);
          let max = Math.max(i, targetIdx);
          // Check if everything between is merchant or space
          for (let j = min + 1; j < max; j++) {
            if (newTokens[j].type !== 'merchant' && newTokens[j].type !== 'space') {
              return false;
            }
          }
          return true;
        });
      };

      if (newTokens[index].type === 'merchant') {
        // Toggle off
        newTokens[index].type = 'static';
      } else if (merchantIndices.length === 0 || isAdjacentIgnoringSpaces(index)) {
        // Add to block
        newTokens[index].type = 'merchant';
      } else {
        // Reset all, start new block
        newTokens.forEach((t, i) => {
          if (t.type === 'merchant') newTokens[i].type = 'static';
        });
        newTokens[index].type = 'merchant';
      }
    }

    else if (currentType === 'wildcard') {
      newTokens[index].type = newTokens[index].type === 'wildcard' ? 'static' : 'wildcard';
    }

    setTokens(newTokens);
    updatePattern(buildRegex(newTokens));
  };

  const handleNextStep = () => {
    if (step === 'amount') setStep('merchant');
    else if (step === 'merchant') setStep('wildcards');
  };

  const previousStep = () => {
    if (step === 'merchant') setStep('amount');
    else if (step === 'wildcards') setStep('merchant');
  }

  const buildRegex = (tokens) => {
    const grouped = groupTokensByType(tokens);
    return grouped
      .map((t) => {
        if (t.type === 'amount') return '(?P<amount>.*?)';
        if (t.type === 'merchant') return '(?P<merchant>.*?)';
        if (t.type === 'wildcard') return '.*?';
        return escapeRegex(t.text);
      })
      .join('');
  };

  const groupTokensByType = (tokens) => {
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

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {step !== 'input' && (
        <>
          <p className="mb-1 font-semibold">
            {step === 'amount' && (
              <>
                1: Select the amount in the message
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleNextStep}
                  style={{ marginLeft: '8px' }}
                >
                  Step 2
                </Button>
              </>
            )}
            {step === 'merchant' && (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={previousStep}
                  style={{ marginRight: '8px' }}
                >
                  Step 1
                </Button>
                2: Select the merchant or payee in the message
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleNextStep}
                  style={{ marginLeft: '8px' }}
                >
                  Step 3
                </Button>
              </>
            )}
            {step === 'wildcards' && (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={previousStep}
                  style={{ marginRight: '8px' }}
                >
                  Step 2
                </Button>
                3: Select ALL the parts of the message that changes per message
              </>
            )}
          </p>
          <TokenSelector tokens={tokens} onSelect={handleSelect} />
        </>
      )}
    </div>
  );
}
