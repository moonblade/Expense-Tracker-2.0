import React, { useState, useEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

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

export default function PatternCreator({input, approve, updatePattern, handleTestPattern}) {
  const [step, setStep] = useState('amount');

  const tokenize = (str) => {
    const regex = /[^\s-]+|[\s-]/g;
    const matches = str.match(regex) || [];

    return matches.map((t) => ({
      text: t,
      type: /[\s-]/.test(t) ? /[\s]/.test(t) ? 'space' : 'delim' : 'static',
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
      // const isMerchant = (i) => newTokens[i] && newTokens[i].type === 'merchant';
      // const isSpace = (i) => newTokens[i] && newTokens[i].type === 'space';

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

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Skip space and delim in grouping logic
      if (token.type === 'space' || token.type === 'delim') {
        // But remember it for potential joining
        currentGroup.separator = token.text;
        continue;
      }

      if (token.type === currentGroup.type) {
        currentGroup.text += (currentGroup.separator || '') + token.text;
      } else {
        if (currentGroup.type !== null) result.push({ text: currentGroup.text, type: currentGroup.type });
        currentGroup = { text: token.text, type: token.type, separator: '' };
      }
    }

    if (currentGroup.type !== null) result.push({ text: currentGroup.text, type: currentGroup.type });
    return result;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
        <>
        <div style={{ display: 'flex', maxWidth: '100%' }}>
          { approve && (
          <>
          <Button
            variant={step === 'amount' ? 'contained' : 'outlined'}
            color="secondary"
            onClick={() => setStep('amount')}
            style={{ paddingLeft: '5px', paddingRight: '5px' }}
          >
            Amount
          </Button>
          <Button
            variant={step === 'merchant' ? 'contained' : 'outlined'}
            color="secondary"
            onClick={() => setStep('merchant')}
            style={{ paddingLeft: '5px', paddingRight: '5px', marginLeft: '5px' }}
          >
            Payee
          </Button>
          </>
          )}
          <Button
            variant={step === 'wildcards' ? 'contained' : 'outlined'}
            color="secondary"
            onClick={() => setStep('wildcards')}
            style={{ paddingLeft: '5px', paddingRight: '5px', marginLeft: '5px' }}
          >
            Wildcards
          </Button>
          <IconButton
              onClick={handleTestPattern}
              title="Test Pattern"
              color="info"
            >
              <TaskAltIcon />
            </IconButton>
        </div>
        <TokenSelector tokens={tokens} onSelect={handleSelect} />
        </>
    </div>
  );
}
