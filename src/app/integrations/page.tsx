import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function WhatsAppMock() {
  return (
    <div className="bg-white rounded-2xl border-8 border-black shadow-xl w-full max-w-sm h-[600px] flex flex-col">
      <div className="bg-gray-100 p-3 flex items-center gap-3 border-b border-gray-200">
        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
          D
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">DiraBiz Bot</h3>
          <p className="text-xs text-gray-500">online</p>
        </div>
      </div>
      <div
        className="flex-1 p-4 space-y-4 overflow-y-auto"
        style={{
          backgroundImage:
            'url("https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")',
          backgroundSize: '300px',
        }}
      >
        <div className="flex justify-start">
          <div className="bg-teal-600 text-white p-3 rounded-lg max-w-[80%]">
            <p className="font-bold">DiraBiz</p>
            <p>Karibu! Andika 'Menu' kuona huduma.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-white text-gray-800 p-3 rounded-lg max-w-[80%] shadow-sm">
            <p>Menu</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-teal-600 text-white p-3 rounded-lg max-w-[80%]">
            <p className="font-bold">DiraBiz</p>
            <p>Chagua huduma:</p>
            <p>1. Uza</p>
            <p>2. Angalia Stoo</p>
            <p>3. Ankara Mpya</p>
            <p>4. Lipa ankara</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 p-2 border-t border-gray-200">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full bg-white rounded-full px-4 py-2 text-sm"
          disabled
        />
      </div>
    </div>
  )
}

function UssdMock() {
  return (
    <div className="bg-gray-800 text-white font-mono rounded-2xl border-8 border-black shadow-xl w-full max-w-sm h-[600px] flex flex-col p-6 justify-center">
      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
        <p>CON DiraBiz Menu</p>
        <p>1. Uza Bidhaa</p>
        <p>2. Angalia Stoo</p>
        <p>3. Ankara Mpya</p>
        <p>4. Idhinisha Malipo</p>
        <p>5. Ripoti</p>
        <p>0. Toka</p>
      </div>
      <div className="mt-4">
        <input
          type="text"
          className="w-full bg-gray-900 rounded p-2 text-center"
          placeholder="Weka chaguo lako"
          disabled
        />
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">
          Access DiraBiz Anywhere
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Perform essential business actions using simple tools you already
          have. No app installation required.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">
              WhatsApp Bot
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-4 sm:p-6">
            <WhatsAppMock />
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Start a chat with our bot at{' '}
                <strong className="text-foreground">+255 742 000 000</strong>
              </p>
              <p>to manage your business on the go.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">USSD Service</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-4 sm:p-6">
            <UssdMock />
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Dial <strong className="text-foreground">*150*88#</strong> from
                any phone
              </p>
              <p>to access DiraBiz services instantly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
