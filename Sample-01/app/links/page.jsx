'use client';

import React, { useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import { Table } from 'reactstrap';

const LinkTables = (links) => {
  return <Table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Email</th>
        <th>TimeStamp</th>
      </tr>
    </thead>
    <tbody>\
      {links.map((link) => {
        return <tr>
          <td>{link.code}</td>
          <td>{link.email}</td>
          <td>{link.timestamp}</td>
        </tr>
      })}
    </tbody>
  </Table>
}


export default withPageAuthRequired(function CSRPage() {

    const [links, setLinks] = useState([]);


    const fetchLinks = async () => {
        const response = await fetch('/api/links');
        setLinks(await response.json())
    }

    useEffect(() => {
        fetchLinks()
    }, [])

    console.log('loinks', links)    

  return (
    <>
        {LinkTables(links)}
    </>
  );
});
