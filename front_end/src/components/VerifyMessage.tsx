import * as React from 'react';
import { verifyMessage } from 'ethers/lib/utils';

const VerifyMessage = () => {
  const [message, setMessage] = React.useState<string | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const [recoveredAddress, setRecoveredAddress] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message && signature) {
      const address = verifyMessage(message, signature);
      setRecoveredAddress(address);
    }
  };

  return (
    <form className='form' onSubmit={handleSubmit}>
      <h2>Verify a signed message</h2>

      <label className="form-label" htmlFor="message">Message:</label>
      <textarea
        className='form-textarea'
        id="message"
        name="message"
        placeholder="metadata..."
        onChange={(e) => setMessage(e.target.value)}
      />

      <label className="form-label" htmlFor="signature">Signature:</label>
      <textarea
        className='form-textarea'
        id="signature"
        name="signature"
        placeholder="0x..."
        onChange={(e) => setSignature(e.target.value)}
      />

      <button className='btn btn-block'>Verify Signature</button>

      {recoveredAddress && (
        <div>
          <h3>Recovered Address:</h3>
          <div>{recoveredAddress}</div>
        </div>
      )}
    </form>
  );
}

export default VerifyMessage
