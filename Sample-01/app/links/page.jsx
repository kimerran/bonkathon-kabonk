'use client';

import React, { useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import { Button, Table } from 'reactstrap';

const LinkTables = links => {
  console.log('links', links)
  return (
    <Table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Email</th>
          <th>TimeStamp</th>
          <th>Share Url</th>
        </tr>
      </thead>
      <tbody>
        {links && links.map(link => {
          return (
            <tr>
              <td>{link.code}</td>
              <td>{link.email}</td>
              <td>{link.timestamp}</td>
              <td>{`http://localhost:3001/claim/${link.code}`}</td>
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

    if (Array.isArray(links) && links.length > 0) {
      return <>
      <Button onClick={async () => {
        fetch('/api/links', {
          method: 'POST'
        }).then(() => fetchLinks());
      }}>Create Link</Button>
      {LinkTables(links)}
      
      </>;
    }
    return <>Unable to load list</>
});
