'use client';

import React, { useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import { Button, Table } from 'reactstrap';
import { QRCodeCanvas } from 'qrcode.react';

const CopyButton = url => {
  console.log('url', url);
  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(url.url);
        alert('Copied to clipboard');
      }}>
      copy
    </Button>
  );
};

const LinkTables = links => {

  const formatCode = (codeVal) => {
    const code = codeVal.toString();
    return code.substring(0, 5) + '...' + code.substring(code.length - 5);
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Code</th>
          {/* <th>Email</th>
          <th>TimeStamp</th> */}
          <th>Share URL</th>
          <th>QR Code</th>
        </tr>
      </thead>
      <tbody>
        {links &&
          links.map(link => {
            const url = `https://kabonk.neri.ph/claim/${link.code}`;
            return (
              <tr>
                <td>{formatCode(link.code)}</td>
                {/* <td>{link.email}</td>
              <td>{link.timestamp}</td> */}
                <td>
                  <CopyButton url={url} />
                </td>
                <td>
                  <QRCodeCanvas value={url} />
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );
};

export default withPageAuthRequired(function CSRPage() {
  const [links, setLinks] = useState([]);

  const fetchLinks = async () => {
    const response = await fetch('/api/links');
    setLinks(await response.json());
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  console.log('loinks', links);

  return (
    <>
      <div className="mb-5">
        <Button
          color="primary"
          onClick={async () => {
            fetch('/api/links', {
              method: 'POST'
            }).then(() => fetchLinks());
          }}>
          Create Link
        </Button>
          {
            (Array.isArray(links) && links.length > 0) ?
            <div style={{ paddingTop: '24px' }}>{LinkTables(links)}</div>

            : <div style={{ paddingTop: '24px' }}>Unable to load list</div>
          }
      </div>
    </>
  );


  if (Array.isArray(links) && links.length > 0) {

  }
  return <>Unable to load list</>;
});